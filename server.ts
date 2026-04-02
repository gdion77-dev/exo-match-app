import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import { parseStringPromise, processors } from 'xml2js';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook MUST be before express.json() to get the raw body
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!endpointSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Get customer details
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0; // Convert cents to euros
      
      // Get Tax ID if the customer provided one (for B2B / Invoices)
      const taxId = session.customer_details?.tax_ids?.[0]?.value;
      
      // Get Postal Code to determine VAT rate (17% vs 24%)
      const postalCode = session.customer_details?.address?.postal_code;
      
      console.log(`Payment successful for ${customerEmail}. Amount: €${amountTotal}. Tax ID: ${taxId || 'None'}. TK: ${postalCode || 'None'}`);

      try {
        // Call Prosvasis Run API to issue the invoice/receipt
        await issueProsvasisInvoice({
          email: customerEmail,
          name: customerName,
          amount: amountTotal,
          stripeSessionId: session.id,
          taxId: taxId,
          postalCode: postalCode
        });
      } catch (error) {
        console.error('Failed to issue invoice in Prosvasis:', error);
        // Note: You might want to save this to a database to retry later
      }
    }

    res.status(200).end();
  });

  app.use(express.json());

  // Prosvasis Run Integration Function
  async function issueProsvasisInvoice(data: { email?: string | null, name?: string | null, amount: number, stripeSessionId: string, taxId?: string, postalCode?: string | null }) {
    const username = process.env.PROSVASIS_USERNAME;
    const password = process.env.PROSVASIS_PASSWORD;
    
    // Σταθερές βάσει των οδηγιών του χρήστη
    const seriesAL = '7068'; // ΑΠΥ
    const seriesTIM = '7067'; // ΤΠΥ
    const paymentMethodCode = '400'; // Πιστωτική Κάρτα
    const appId = '703'; // ENTERSOFTONE Go App ID
    
    if (!username || !password) {
      console.warn('Prosvasis credentials not set. Skipping invoice generation.');
      return;
    }

    console.log('Initiating Prosvasis Run API call for:', data.email);

    try {
      const baseUrl = 'https://go.s1cloud.net/s1services';
      const headers = {
        's1code': username,
        'Content-Type': 'application/json'
      };

      let trdr = null;

      // ΒΗΜΑ 1: Εύρεση ή Δημιουργία Πελάτη
      // Αν υπάρχει ΑΦΜ, ψάχνουμε τον πελάτη
      if (data.taxId) {
        const searchRes = await axios.post(`${baseUrl}/list/customer`, {
          appId: appId,
          token: password,
          filters: `CUSTOMER.AFM=${data.taxId}`
        }, { headers });

        if (searchRes.data && searchRes.data.success && searchRes.data.rows && searchRes.data.rows.length > 0) {
          // Το TRDR είναι το εσωτερικό ID του πελάτη στο SoftOne
          trdr = searchRes.data.rows[0].TRDR;
        }
      }

      // Αν δεν βρέθηκε ή δεν υπάρχει ΑΦΜ (Λιανική), δημιουργούμε νέο πελάτη
      if (!trdr) {
        const customerData: any = {
          NAME: data.name || 'Πελάτης Λιανικής',
          EMAIL: data.email || '',
          ZIP: data.postalCode || ''
        };
        if (data.taxId) {
          customerData.AFM = data.taxId;
        }

        const createRes = await axios.post(`${baseUrl}/set/customer`, {
          appId: appId,
          token: password,
          data: {
            CUSTOMER: [customerData]
          }
        }, { headers });

        if (createRes.data && createRes.data.success) {
          trdr = createRes.data.id;
        } else {
          throw new Error("Failed to create customer in Prosvasis: " + JSON.stringify(createRes.data));
        }
      }

      // ΒΗΜΑ 2: Έλεγχος Ταχυδρομικού Κώδικα για Μειωμένο ΦΠΑ (17%)
      // Νησιά Αιγαίου: Λέσβος, Χίος, Σάμος, Κως, Λέρος κλπ.
      const isReducedVat = (tk: string | null | undefined) => {
        if (!tk) return false;
        const cleanTk = tk.replace(/\s/g, '');
        // Προθέματα ΤΚ για περιοχές με μειωμένο ΦΠΑ
        const reducedPrefixes = ['811', '812', '813', '814', '821', '822', '823', '831', '832', '853', '854'];
        return reducedPrefixes.some(prefix => cleanTk.startsWith(prefix));
      };

      const hasReducedVat = isReducedVat(data.postalCode);
      const vatPercent = hasReducedVat ? 17 : 24;
      const vatCode = hasReducedVat ? '1170' : '1410';
      const itemCode = hasReducedVat ? '0000008' : '0000007';

      // Υπολογισμός Καθαρής Αξίας
      // Το data.amount είναι το τελικό (με ΦΠΑ). Πρέπει να βρούμε το καθαρό.
      const netAmount = data.amount / (1 + (vatPercent / 100));

      // Αν υπάρχει ΑΦΜ (taxId), κόβουμε Τιμολόγιο. Αλλιώς Απόδειξη.
      const isInvoice = !!data.taxId;
      const documentSeries = isInvoice ? seriesTIM : seriesAL;

      // ΒΗΜΑ 3: Δημιουργία Παραστατικού (SALDOC)
      const invoicePayload = {
        appId: appId,
        token: password,
        data: {
          SALDOC: [
            {
              SERIES: documentSeries,
              TRDR: trdr,
              PAYMENT: paymentMethodCode,
              REMARKS: `Εξόφληση συνδρομής (Stripe ID: ${data.stripeSessionId})`
            }
          ],
          SRVLINES: [
            {
              LINENUM: 1,
              MTRL_SERVICE_CODE: itemCode,
              QTY1: 1,
              PRICE: Number(netAmount.toFixed(2)),
              VAT: vatCode
            }
          ]
        }
      };

      const invoiceResponse = await axios.post(`${baseUrl}/set/saldoc`, invoicePayload, { headers });
      
      if (invoiceResponse.data && invoiceResponse.data.success) {
        console.log(`Prosvasis Document (${documentSeries}) Created Successfully. ID:`, invoiceResponse.data.id);
      } else {
        console.error('Prosvasis Document Creation Failed:', invoiceResponse.data);
      }
      
    } catch (error: any) {
      console.error('Prosvasis API Error:', error.response?.data || error.message);
    }
  }

  // AADE API Route
  app.get('/api/aade/afm/:afm', async (req, res) => {
    const { afm } = req.params;
    const username = process.env.AADE_USERNAME;
    const password = process.env.AADE_PASSWORD;
    const calledByAfm = process.env.AADE_CALLED_BY_AFM;

    if (!username || !password || !calledByAfm) {
      return res.status(500).json({ error: 'Τα διαπιστευτήρια της ΑΑΔΕ δεν έχουν ρυθμιστεί στον server.' });
    }

    const xmlRequest = `
      <env:Envelope xmlns:env="http://www.w3.org/2003/05/soap-envelope" xmlns:ns1="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:ns2="http://rgwspublic2/RgWsPublic2Service" xmlns:ns3="http://rgwspublic2/RgWsPublic2">
        <env:Header>
          <ns1:Security>
            <ns1:UsernameToken>
              <ns1:Username>${username}</ns1:Username>
              <ns1:Password>${password}</ns1:Password>
            </ns1:UsernameToken>
          </ns1:Security>
        </env:Header>
        <env:Body>
          <ns2:rgWsPublic2AfmMethod>
            <ns2:INPUT_REC>
              <ns3:afm_called_by>${calledByAfm}</ns3:afm_called_by>
              <ns3:afm_called_for>${afm}</ns3:afm_called_for>
            </ns2:INPUT_REC>
          </ns2:rgWsPublic2AfmMethod>
        </env:Body>
      </env:Envelope>
    `;

    try {
      const response = await axios.post(
        'https://www1.gsis.gr/wsaade/RgWsPublic2/RgWsPublic2',
        xmlRequest,
        {
          headers: {
            'Content-Type': 'application/soap+xml; charset=utf-8',
          },
        }
      );

      const result = await parseStringPromise(response.data, { 
        explicitArray: false,
        tagNameProcessors: [processors.stripPrefix]
      });
      
      const body = result.Envelope.Body;
      const fault = body.Fault;
      
      if (fault) {
         return res.status(400).json({ error: fault.Reason?.Text || fault.faultstring || 'Άγνωστο σφάλμα ΑΑΔΕ' });
      }
      
      const responseMethod = body.rgWsPublic2AfmMethodResponse;
      if (!responseMethod) {
         return res.status(500).json({ error: 'Μη αναμενόμενη μορφή απάντησης από ΑΑΔΕ.' });
      }

      const rtType = responseMethod.result.rg_ws_public2_result_rtType;
      const errorRec = rtType.error_rec;
      
      if (errorRec && errorRec.error_code) {
         // Some XML parsers might return an empty object {} if the tag is empty
         if (typeof errorRec.error_code === 'string' && errorRec.error_code.trim() !== '') {
            return res.status(400).json({ error: errorRec.error_descr });
         }
      }
      
      const basicRec = rtType.basic_rec;
      
      const companyData = {
        name: basicRec.onomasia || '',
        address: `${basicRec.postal_address || ''} ${basicRec.postal_address_no || ''}, ${basicRec.postal_area || ''} ${basicRec.postal_zip_code || ''}`.replace(/\s+/g, ' ').trim(),
        doy: basicRec.doy_descr || '',
        professionTitle: basicRec.commer_title || '',
      };

      res.json(companyData);
    } catch (error: any) {
      console.error('AADE API Error:', error.message);
      res.status(500).json({ error: 'Σφάλμα κατά την επικοινωνία με την ΑΑΔΕ.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
