const { NlpManager } = require('node-nlp');
const path = require('path');
const Checkout = require('../checkout.model');

class Chatbot {
    constructor() {
        this.manager = new NlpManager({ languages: ['en'] });
        this.loadModel();
    }

    async loadModel() {
        await this.manager.load(path.join(__dirname, 'model.nlp'));
    }

    async processMessage(message) {
        // Check if message contains order number pattern
        const orderNumberMatch = message.match(/[#]?([a-fA-F0-9]{24})/);
        
        if (orderNumberMatch) {
            const orderNumber = orderNumberMatch[1];
            try {
                // Find order in database
                const order = await Checkout.findOne({ _id: orderNumber });
                
                if (!order) {
                    return "I couldn't find an order with that number. Please check the number and try again.";
                }
    
                // Check order status and return appropriate message
                if (order.status === 'Completed') {
                    return `Great news! Your order #${orderNumber} has been shipped and is on its way to you!
                            Shipping Address: ${order.address}, ${order.city}
                            Total Amount: $${order.totalPrice}`;
                } else {
                    return `Your order #${orderNumber} is currently being processed.
                            Current Status: ${order.status}
                            We'll notify you once it's shipped!`;
                }
            } catch (error) {
                console.error('Error checking order:', error);
                return "I'm having trouble checking that order. Please make sure you've entered a valid order number.";
            }
        }
    
        // Regular NLP processing for other queries
        const response = await this.manager.process('en', message);
        return response.answer || "I'm sorry, I don't understand. Could you please rephrase that?";
    }
    
}

module.exports = new Chatbot();
