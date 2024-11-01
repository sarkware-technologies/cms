import MYDBM from "./mysql";

class OrderImporter {

    constructor() {

        this.orderListQuery = `select OrderId from orders`;
        this.orderDetailsQuery = `
        SELECT 
            o.OrderId, 
            od.OrderDetailId, 
            o.PartyCode, 
            o.StoreId, 
            rsp.RetailerId, 
            o.OrderDate, 
            o.OrderAmount,
            o.CreatedBy,
            o.IsUploaded,
            o.UploadDate,
            o.IsProcessed,
            o.ProcessedDate, 
            o.OrderSource,    
            o.OrderPlacedBy, 
            od.ProductCode, 
            od.Quantity,      
            od.ActualQuantityReceived, 
            od.PTR,
            s.StoreName,      
            spr.CompanyCode,
            spr.Company,
            mspm.MDM_PRODUCT_CODE 
        FROM 
            orderdetails od    
        INNER JOIN orders o ON o.OrderId = od.OrderId
        INNER JOIN stores AS s ON o.StoreId = s.StoreId
        INNER JOIN storeparties AS sp ON o.StoreId = sp.StoreId AND o.PartyCode = sp.PartyCode
        LEFT JOIN storeproducts spr ON od.StoreId = spr.StoreId AND od.ProductCode = spr.ProductCode
        INNER JOIN retailerstoreparties rsp ON s.StoreId = rsp.StoreId  AND ((o.PartyCode = rsp.PartyCode) OR ((o.PartyCode IS  NULL) AND (rsp.PartyCode IS  NULL)))
        INNER JOIN users u ON o.CreatedBy = u.UserId
        LEFT JOIN mdm_store_product_master mspm ON mspm.PRODUCT_CODE = od.ProductCode AND mspm.STOREID = o.StoreId 
        WHERE od.OrderId=?;
        `;

    }

    check = async () => {

    };

    doOrderImport = async () => {

        try {

            const orders = await MYDBM.queryWithConditions(this.orderListQuery, []); 

            /* Estimate the batch processing */
            
                 


        } catch (e) {
            console.log(e);
        }

    };

    doRetailerImport = async () => {

        try {

            const orders = await MYDBM.queryWithConditions(this.orderListQuery, []); 

            /* Estimate the batch processing */
            
                 


        } catch (e) {
            console.log(e);
        }

    };

}