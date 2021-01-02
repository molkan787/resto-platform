module.exports = class MurewStockSync{

    static setStocks(stocks){
        const queries = stocks.map(({ id, stock }) => (
            strapi.query('product').update({ remote_id: id }, { stock })
        ));
        return Promise.all(queries);
    }

}