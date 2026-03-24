export interface Asset {
  id: string;
  description: string;
  region: string;
  kaek: string;
  atak: string;
  ownershipPercentage: number;
  objectiveValue: number;
  type: string;
  rightType?: string;
  ownerName: string;
  afm?: string;
  memberType?: string;
  value?: number;
  [key: string]: any;
}

export interface FundAsset {
  id: string;
  assetCode: string;
  kaek: string;
  address: string;
  region: string;
  commercialValue: number;
  ownerName: string;
  assetCategory: string;
  description?: string;
  matchReason?: string;
  isFuzzyMatch?: boolean;
  [key: string]: any;
}

export interface Collateral {
  id: string;
  assetCode: string;
  creditor: string;
  amount: number;
  type: string;
  order: number;
  [key: string]: any;
}

export interface FinancialAsset {
  id: string;
  afm: string;
  assetCategory: string;
  description: string;
  value: number;
  matchReason?: string;
  globalCode?: number;
  [key: string]: any;
}

export interface SingularizedAsset {
  asset: {
    id: string;
    ownershipPercentage: number;
    ownerName: string;
    description: string;
    value?: number;
    region?: string;
    objectiveValue?: number;
    [key: string]: any;
  };
  originalAssets: Asset[];
  encumbrances: FundAsset[];
  collaterals: Collateral[];
  liquidationValue: number;
  totalAssetValue: number;
  status: string;
  alerts: any[];
  globalCode: string | number;
  type?: 'PROPERTY' | 'OTHER_ASSET' | 'FINANCIAL_ASSET' | 'ORPHAN_PROPERTY' | 'ORPHAN_OTHER' | 'SPECIAL';
  bankCode?: string;
  sharedWith?: string[];
  totalGroupOwnership?: number;
  id?: string;
  description?: string;
  value?: number;
  [key: string]: any;
}
