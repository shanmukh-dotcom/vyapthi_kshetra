import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DealFlowDemo from './components/DealFlowDemo';
import TransportOptionsModal from './components/TransportOptionsModal';
import FarmerTransportView from './components/FarmerTransportView';
import BuyerShipmentView from './components/BuyerShipmentView';
import TransporterDashboard from './components/TransporterDashboard';
import NotificationToast from './components/NotificationToast';
import PotatoQualityPage from './pages/PotatoQualityPage';
import { bookTransport, updateBookingStatus, getBookingByDeal, matchTransporters } from './services/api';

export default function App() {
  const [activeRole, setActiveRole] = useState('DEMO_FLOW');
  const [matchData, setMatchData] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load existing booking and match options automatically on startup
  useEffect(() => {
    async function initLogisticsData() {
      try {
        const res = await getBookingByDeal("deal_potato_88");
        if (res.found && res.booking) {
          setActiveBooking(res.booking);
        }

        // Auto-query matching options for initial dashboard & map display
        const matchRes = await matchTransporters({
          deal_id: "deal_potato_88",
          farmer_lat: 16.506,
          farmer_lng: 80.648,
          factory_lat: 16.518,
          factory_lng: 80.619,
          quantity_kg: 2000,
          crop: "Potato",
          search_radius_km: 50.0
        });
        setMatchData(matchRes);
      } catch (e) {
        console.error("Initialization error:", e);
      }
    }
    initLogisticsData();
  }, []);

  const addToast = (title, message) => {
    setToasts((prev) => [...prev, { title, message }]);
  };

  const removeToast = (idx) => {
    setToasts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTransportTriggered = (data) => {
    setMatchData(data);
    addToast("Transport Matching Active", `Found ${data.options.length} suitable transporters near Farmer & Buyer hubs.`);
  };

  const handleSearchRadiusChange = async (radiusKm) => {
    if (!matchData) return;
    try {
      const updated = await matchTransporters({
        deal_id: matchData.deal_id,
        farmer_lat: matchData.farmer_lat,
        farmer_lng: matchData.farmer_lng,
        factory_lat: matchData.factory_lat,
        factory_lng: matchData.factory_lng,
        quantity_kg: matchData.quantity_kg,
        crop: matchData.crop,
        search_radius_km: radiusKm
      });
      setMatchData(updated);
      addToast("Search Radius Updated", `Filter updated to ${radiusKm} km radius. Found ${updated.options.length} transporters.`);
    } catch (err) {
      alert("Error expanding radius: " + err.message);
    }
  };

  const handleSelectProvider = async (provider, matchInfo) => {
    const info = matchInfo || matchData;
    if (!info) return;

    try {
      const payload = {
        deal_id: info.deal_id,
        transport_provider_id: provider.id,
        farmer_id: "usr_farmer_101",
        buyer_id: "usr_buyer_201",
        crop: info.crop,
        quantity_kg: info.quantity_kg,
        pickup_lat: info.farmer_lat,
        pickup_lng: info.farmer_lng,
        pickup_address: info.farmer_address,
        delivery_lat: info.factory_lat,
        delivery_lng: info.factory_lng,
        delivery_address: info.factory_address,
        distance_km: info.route_distance_km,
        estimated_duration: info.estimated_duration,
        estimated_cost: provider.estimated_cost,
        cost_per_kg: provider.cost_per_kg,
        is_fallback_distance: info.is_fallback_distance
      };

      const booking = await bookTransport(payload);
      setActiveBooking(booking);

      addToast("Transport Booked!", `Assigned ${provider.name} (${provider.vehicle_type}). Status: BOOKED.`);
    } catch (err) {
      alert("Booking error: " + err.message);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const updated = await updateBookingStatus(bookingId, newStatus);
      setActiveBooking(updated);

      let msg = `Shipment status updated to ${newStatus}.`;
      if (newStatus === 'PICKED_UP') msg = 'Crop picked up from farmer location!';
      if (newStatus === 'IN_TRANSIT') msg = 'Shipment is now in transit on highway.';
      if (newStatus === 'DELIVERED') msg = 'Shipment delivered successfully to factory!';

      addToast(`Status Update: ${newStatus}`, msg);
    } catch (err) {
      alert("Status update error: " + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        notificationCount={toasts.length}
      />

      <main className="main-content">
        {activeRole === 'DEMO_FLOW' && (
          <>
            <DealFlowDemo onTransportTriggered={handleTransportTriggered} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {matchData && (
                <TransportOptionsModal
                  matchData={matchData}
                  onSelectProvider={handleSelectProvider}
                  onSearchRadiusChange={handleSearchRadiusChange}
                  onClose={() => {}}
                />
              )}

              {activeBooking && (
                <FarmerTransportView
                  booking={activeBooking}
                  matchData={matchData}
                  onSelectProvider={handleSelectProvider}
                  onSearchRadiusChange={handleSearchRadiusChange}
                  onNavigateToPotatoAI={() => setActiveRole('POTATO_AI')}
                />
              )}
            </div>
          </>
        )}

        {activeRole === 'POTATO_AI' && (
          <PotatoQualityPage
            onContinueToSell={(result) => {
              setActiveRole('DEMO_FLOW');
              addToast(
                "Potato Quality Verified",
                `Grade ${result.grade} (${Math.round(result.quality_score)}/100) attached to consignment. Transport matching is active.`
              );
            }}
            onSelectRole={setActiveRole}
          />
        )}

        {activeRole === 'FARMER' && (
          <FarmerTransportView
            booking={activeBooking}
            matchData={matchData}
            onSelectProvider={handleSelectProvider}
            onSearchRadiusChange={handleSearchRadiusChange}
            onNavigateToPotatoAI={() => setActiveRole('POTATO_AI')}
          />
        )}

        {activeRole === 'BUYER' && (
          <BuyerShipmentView
            booking={activeBooking}
            matchData={matchData}
            onSelectProvider={handleSelectProvider}
            onSearchRadiusChange={handleSearchRadiusChange}
          />
        )}

        {activeRole === 'TRANSPORTER' && (
          <TransporterDashboard
            booking={activeBooking}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>

      <NotificationToast notifications={toasts} onClose={removeToast} />
    </div>
  );
}
