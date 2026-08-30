import React from 'react';
import { MapPin, Calendar, Wallet } from 'lucide-react';

interface ItineraryPrintTemplateProps {
  plan: any;
}

const colors = {
  primary: '#059669',
  slate900: '#0f172a',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  white: '#ffffff'
};

export const ItineraryPrintTemplate = React.forwardRef<HTMLDivElement, ItineraryPrintTemplateProps>(
  ({ plan }, ref) => {
    const itinerary = plan?.itinerary || [];
    const title = plan?.title || `${plan?.destination || plan?.city || 'India'} Plan`;
    const budget = plan?.totalBudget || plan?.budget || 0;

    return (
      <div 
        ref={ref}
        style={{ 
          all: 'initial', // Kill all inheritance
          display: 'block',
          width: '794px', 
          backgroundColor: colors.white, 
          color: colors.slate900,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
          boxSizing: 'border-box',
          minHeight: '1123px',
          position: 'relative',
          lineHeight: '1.5'
        }}
      >
        {/* Header Section */}
        <div style={{ borderBottom: `4px solid ${colors.primary}`, paddingBottom: '30px', marginBottom: '40px' }}>
          <div style={{ color: colors.primary, fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>
            GoTripo Travel Guide
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: colors.slate900, margin: '0 0 20px 0', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          
          <div style={{ display: 'flex', gap: '30px', fontSize: '16px', color: colors.slate600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color={colors.primary} strokeWidth={2.5} />
              <span style={{ fontWeight: '600' }}>{plan?.days || itinerary.length} Days</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color={colors.primary} strokeWidth={2.5} />
              <span style={{ fontWeight: '600' }}>{plan?.destination || plan?.city}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} color={colors.primary} strokeWidth={2.5} />
              <span style={{ fontWeight: '600' }}>₹{budget.toLocaleString('en-IN')} / person</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          {itinerary.map((day: any, idx: number) => (
            <div key={idx} style={{ pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: colors.slate50, padding: '20px', borderRadius: '16px', marginBottom: '30px' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px', 
                  backgroundColor: colors.primary, 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: '800', 
                  fontSize: '22px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
                }}>
                   {day.day || idx + 1}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: colors.slate900, margin: 0 }}>
                    {day.title || day.theme || 'Daily Exploration'}
                  </h2>
                  <div style={{ fontSize: '14px', color: colors.slate500, fontWeight: '600', marginTop: '4px' }}>
                    {(day.places || day.items || []).length} Points of Interest
                  </div>
                </div>
              </div>

              <div style={{ marginLeft: '28px', borderLeft: `3px dashed ${colors.slate200}`, padding: '10px 0' }}>
                {(day.places || day.items || day.activities || []).map((activity: any, aIdx: number) => (
                  <div key={aIdx} style={{ position: 'relative', paddingLeft: '40px', marginBottom: '40px' }}>
                    <div style={{ 
                      position: 'absolute', 
                      left: '-11px', 
                      top: '8px', 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: 'white', 
                      border: `3px solid ${colors.primary}`,
                      boxSizing: 'border-box'
                    }} />
                    
                    <div style={{ fontSize: '13px', fontWeight: '800', color: colors.primary, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {activity.time || 'Scheduled'}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.slate900, marginBottom: '8px', marginTop: 0 }}>
                      {activity.name || activity.place || activity.activity}
                    </h3>
                    <p style={{ color: colors.slate600, fontSize: '16px', lineHeight: '1.7', maxWidth: '600px', margin: 0 }}>
                      {activity.desc || activity.description || activity.tag}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div style={{ 
          marginTop: '80px', 
          paddingTop: '40px', 
          borderTop: `2px solid ${colors.slate100}`, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: '12px', 
          color: colors.slate400, 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em' 
        }}>
          <div>Generated by GoTripo AI</div>
          <div>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
    );
  }
);

ItineraryPrintTemplate.displayName = 'ItineraryPrintTemplate';
