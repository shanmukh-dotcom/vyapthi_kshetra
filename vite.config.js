import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        role: resolve(__dirname, 'role.html'),
        farmerProfile: resolve(__dirname, 'farmer-profile.html'),
        farmerHome: resolve(__dirname, 'farmer-home.html'),
        farmerMyFarm: resolve(__dirname, 'farmer-my-farm.html'),
        farmerMarket: resolve(__dirname, 'farmer-market.html'),
        farmerGradeSell: resolve(__dirname, 'farmer-grade-sell.html'),
        farmerFindBuyers: resolve(__dirname, 'farmer-find-buyers.html'),
        farmerCollectiveLogistics: resolve(__dirname, 'farmer-collective-logistics.html'),
        farmerTransactions: resolve(__dirname, 'farmer-transactions.html'),
        buyerDashboard: resolve(__dirname, 'buyer-dashboard.html'),
        consumerHome: resolve(__dirname, 'consumer-home.html'),
        consumerMyRequirements: resolve(__dirname, 'consumer-my-requirements.html'),
        consumerMatchSource: resolve(__dirname, 'consumer-match-source.html'),
        consumerSupplyJourney: resolve(__dirname, 'consumer-supply-journey.html'),
        consumerOrdersDelivery: resolve(__dirname, 'consumer-orders-delivery.html'),
      },
    },
  },
});
