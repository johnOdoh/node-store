const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const password = 'A secret';

module.exports = class Functions {
        static mapper(products) {
            let categories = {};
            products.map(p => {
                if (categories[p.category] === undefined) {
                    categories[p.category] = {};
                    categories[p.category].male = 0;
                    categories[p.category].female = 0;
                    categories[p.category].both = 0;
                }
                if (p.sex === 'male') {
                    return categories[p.category].male += 1;
                } else if (p.sex === 'female') {
                    return categories[p.category].female += 1;
                } else {
                    return categories[p.category].both += 1;
                }
            })
            return categories;
        }

        static orderDetails(orders) {
            const currentDate = new Date();
            const timeDifference = 1000 * 60 * 60 * 24 * 7;
            let categories = {
                year: {
                    qty: 0,
                    amount: 0
                },
                month: {
                    qty: 0,
                    amount: 0
                },
                week: {
                    qty: 0,
                    amount: 0
                },
                today: {
                    qty: 0,
                    amount: 0
                }
            }
            orders.forEach(p => {
                if (p.time.getFullYear() === currentDate.getFullYear()) {
                    categories.year.qty += 1;
                    categories.year.amount += p.total;
                    if (p.time.getMonth() === currentDate.getMonth()) {
                        categories.month.qty += 1;
                        categories.month.amount += p.total;
                        if (p.time.getDate() === currentDate.getDate()) {
                            categories.today.qty += 1;
                            categories.today.amount += p.total;
                        }
                    }
                }
                if ((currentDate.getTime() - timeDifference) <= p.time.getTime()) {
                    categories.week.qty += 1;
                    categories.week.amount += p.total;
                }
            })
            return categories;
        }

        static encrypt(text) {
            var cipher = crypto.createCipher(algorithm, password)
            var crypted = cipher.update(text, 'utf8', 'hex')
            crypted += cipher.final('hex');
            return crypted;
        }


        static decrypt(text) {
                var decipher = crypto.createDecipher(algorithm, password)
                var dec = decipher.update(text, 'hex', 'utf8')
                dec += decipher.final('utf8');
                return dec;
            }
            // static formatDate(timestamp) {
            //     const day = timestamp.getDate();
            //     const month = timestamp.getMonth() + 1;
            //     const year = timestamp.getFullYear();
            //     const hours = timestamp.getHours()
            //     const minutes = timestamp.getMinutes();
            //     const seconds = timestamp.getSeconds();
            //     return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            // }
    }
    // static mapper(products) {
    //     let categories = {};
    //     products.map(p => {
    //         if (categories[p.category] === undefined) {
    //             categories[p.category] = [];
    //         }
    //         return categories[p.category].push(p);
    //     })
    //     return categories;
    // }