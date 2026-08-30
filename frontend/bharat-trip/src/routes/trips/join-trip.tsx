import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, MapPin, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import AvailabilityMatcher from "@/components/collabRoom/AvailabilityMatcher";
import { AppShell } from "@/components/AppShell";

const JoinTrip = () => {
  const { tripId, token } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        // We might need a public endpoint for this or just allow it if we have the tripId
        const res = await api.get(`/public/trips/${tripId}`);
        setTrip(res.data.trip || res.data);
      } catch (err) {
        console.error(err);
        toast.error("Trip not found or invalid link");
      } finally {
        setLoading(false);
      }
    };

    const savedName = localStorage.getItem(`gotripo_guest_name_${tripId}`);
    if (savedName) {
      setGuestName(savedName);
      setIsJoined(true);
    }

    fetchTripDetails();
  }, [tripId]);

  const handleJoin = () => {
    if (!guestName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    localStorage.setItem(`gotripo_guest_name_${tripId}`, guestName);
    setIsJoined(true);
    toast.success(`Welcome, ${guestName}!`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0e0e10]">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  if (!trip) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0e0e10] text-white">
      <h1 className="text-2xl font-bold mb-4">Trip Not Found</h1>
      <Button onClick={() => navigate("/")}>Go Home</Button>
    </div>
  );

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0e0e10] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {!isJoined ? (
            <Card className="bg-white/5 border-white/10 p-8 max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">You're Invited!</h1>
              <p className="text-white/60 mb-8">
                Join <span className="text-white font-semibold">{trip.title}</span> to help decide the dates.
              </p>
              
              <div className="space-y-4 text-left mb-8">
                <div className="flex items-center gap-3 text-white/80">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{trip.destination}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-white/40">Enter your name to start voting</label>
                  <Input 
                    placeholder="Your Name" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-12"
                  />
                </div>
                <Button 
                  onClick={handleJoin} 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold"
                >
                  Join Trip
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white">{trip.title}</h1>
                  <p className="text-white/40 flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" /> {trip.destination}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-sm">Voter</p>
                  <p className="text-white font-semibold">{guestName}</p>
                </div>
              </div>

              <AvailabilityMatcher 
                tripId={tripId!} 
                isOrganizer={false} 
                currentUser={null}
                members={trip.members || []}
              />

              <div className="text-center">
                <p className="text-white/20 text-sm">
                  Want to plan your own trip? <Button variant="link" className="text-primary p-0" onClick={() => navigate("/auth")}>Create an account</Button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default JoinTrip;
