    export class SubscriptionPlan {
        /**
         * @param {number} id
         * @param {string} name
         * @param {number} price
         * @param {string} description
         * @param {string[]} features
         * @param {boolean} isPopular
         */
        constructor(id, name, price, description, features, isPopular = false) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.description = description;
            this.features = features;
            this.isPopular = isPopular;
        }
    }