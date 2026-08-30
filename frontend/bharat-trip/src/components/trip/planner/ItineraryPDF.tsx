import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
    paddingBottom: 20,
  },
  brandName: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 25,
    marginTop: 5,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
  },
  metaValue: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  dayContainer: {
    marginTop: 25,
    marginBottom: 15,
  },
  dayHeader: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  dayBadge: {
    backgroundColor: '#059669',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayTitleContainer: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  daySubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    fontWeight: 'bold',
  },
  timelineContainer: {
    marginLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
    borderLeftStyle: 'dashed',
    paddingLeft: 30,
  },
  activityItem: {
    marginBottom: 30,
    position: 'relative',
  },
  activityDot: {
    position: 'absolute',
    left: -41,
    top: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#059669',
  },
  time: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: 'bold',
  }
});

interface ItineraryPDFProps {
  plan: any;
}

export const ItineraryPDF = ({ plan }: ItineraryPDFProps) => {
  const itinerary = plan?.itinerary || [];
  const title = plan?.title || `${plan?.destination || plan?.city || 'India'} Journey`;
  const daysCount = plan?.days || itinerary.length;
  const budget = plan?.totalBudget || plan?.budget || 0;

  return (
    <Document title={`${title} - GoTripo`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandName}>GoTripo Travel Guide</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{daysCount} Days</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{plan?.destination || plan?.city || 'India'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>₹{budget.toLocaleString('en-IN')} / person</Text>
            </View>
          </View>
        </View>

        {itinerary.map((day: any, idx: number) => (
          <View key={idx} style={styles.dayContainer} wrap={false}>
            <View style={styles.dayHeader}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>{day.day || idx + 1}</Text>
              </View>
              <View style={styles.dayTitleContainer}>
                <Text style={styles.dayTitle}>{day.title || day.theme || 'Daily Exploration'}</Text>
                <Text style={styles.daySubtitle}>
                  {(day.places || day.items || day.activities || []).length} Points of Interest
                </Text>
              </View>
            </View>

            <View style={styles.timelineContainer}>
              {(day.places || day.items || day.activities || []).map((activity: any, aIdx: number) => (
                <View key={aIdx} style={styles.activityItem}>
                  <View style={styles.activityDot} />
                  <Text style={styles.time}>{activity.time || 'Scheduled'}</Text>
                  <Text style={styles.placeName}>{activity.name || activity.place || activity.activity}</Text>
                  <Text style={styles.description}>
                    {activity.desc || activity.description || activity.tag || ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Generated by GoTripo AI  |  Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};
