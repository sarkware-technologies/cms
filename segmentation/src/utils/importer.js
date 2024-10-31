import MYDBM from "./mysql";

class OrderImporter {

    constructor() {}

    check = async () => {

    };

    begin = async () => {

        try {

            const orders = await MYDBM.queryWithConditions(`select * from orders`, []); 
                 


        } catch (e) {
            console.log(e);
        }

    };

}