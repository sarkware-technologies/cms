export default class searchResponseModel {
  constructor() {
    this.StoreId = 0;
    this.StoreName = '';
    this.ProductName = '';
    this.ProductFullName = '';
    this.ProductCode = '';
    this.DisplayProductCode = '';
    this.Packing = '';
    this.MRP = 0.0;
    this.PTR = 0.0;
    this.Company = '';
    this.CompanyCode = '';
    //this.RShowSchemes = 0;
    this.Scheme = '';
    this.SchFrom = '';
    this.SchUpto = '';
    this.Stock = 0;
    this.ProductLock = false;
    this.HiddenPTR = 0.0;
    this.ShowPTR = false;
    this.RShowPtr = 0;
    this.RShowPtrForAllCompanies = 0;
    this.AllowMinQty = 0;
    this.AllowMaxQty = 0;
    this.StepUpValue = 0;
    this.AllowMOQ = false;
    this.RetailerSchemePreference = 0;
    this.RetailerSchemePriority = 0;
    this.RegExProductName = '';
    this.DisplayHalfScheme = false;
    this.DisplayHalfSchemeOn = '';
    this.RoundOffDisplayHalfScheme = 0;
    this.RStockVisibility = 0;
    this.IsMapped = 0;
    this.NonMapPartyCode = '';
    this.IsShowNonMappedOrderStock = 0;
    this.OrderRemarks = false;
    this.OrderDeliveryModeStatus = 0;
    this.IsPartyLocked = 0;
    this.IsPartyLockedSoonByDist = 0;
    this.HalfSchemeValueToRetailer = 0;
    this.RewardSchemeId = 0;
    this.NetRate = 0;
    this.PrProductName = '';
    this.PrProductId = 0;
    this.AvailDistributorCount = 0;
    this.PrRegexProductName = '';
    this.DiscountPercentScheme = '';
    this.Margin = 0.0;
    this.CashbackMessage = null;
    this.CashbackMinQuantity = 0;
    this.CashbackMaxQuantity = '';
    this.CashbackTermsAndConditions = null;
    this.StoreProductGST = 0.0;
    this.AvailableStoreCount = 0;
    this.RateValidity = 0;
    this.CompanyId = 0;
    this.CompanyName = '';
    this.ExpiryDate = '';
    this.CashbackFromDate = null;
    this.CashbackEndDate = null;
    this.MobileNumber = '';
    this.MaxCashback = '';
    this.IsGroupWisePTR = 0;
    this.IsGroupWisePTRRetailer = 0;
    this.CasePacking = '';
    this.BoxPacking = '';
    this.Category = '';
    this.DProductLock = '';
    this.StockVisibility = '';
    this.MDMProductCode = '';
    this.StoreStatus = '';
    this.SuggestedQuantity = [];
    this.DoNotShowToRetailer = 0;
    this.IsHidden = false;
    this.ptrGroup = null;
    this.PTRA = 0;
    this.PTRB = 0;
    this.PTRC = 0;
    this.PTRD = 0;
  }
}