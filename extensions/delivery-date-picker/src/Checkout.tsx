import {
  reactExtension,
  Banner,
  DatePicker,
  BlockStack,
  Text,
  Heading,
  View,
  useApplyMetafieldsChange,
  useMetafield,
  useAppMetafields,
  useBuyerJourneyIntercept
} from '@shopify/ui-extensions-react/checkout';
import { useCallback, useState, useMemo } from 'react';

// Define the types for the DatePicker component
type SelectedDate = string[] | string;
type YearMonth = { year: number; month: number };

export default reactExtension(
  'purchase.checkout.block.render',
  () => <DeliveryDatePicker />,
);

function DeliveryDatePicker() {
  const deliveryDateMetafield = useMetafield({
    namespace: "custom",
    key: "delivery_date"
  });

  // Get blocked days from app metafields
  const blockedDaysData = useAppMetafields({
    namespace: "blockedDays",
    key: "blockedDays"
  });

  const datesData = useAppMetafields({
    namespace: "dates",
    key: "dates"
  });

  const applyMetafieldsChange = useApplyMetafieldsChange();
  const [selectedDate, setSelectedDate] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const dateHelpers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const currentYearMonth: YearMonth = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    };

    return { today, yesterday, currentYearMonth };
  }, []);

  const blockedDates = useMemo(() => {
    if (!datesData || datesData.length === 0) return [];

    try {
      const datesValue = datesData[0]?.metafield?.value;
      if (typeof datesValue === 'string') {
        return JSON.parse(datesValue);
      }
      return [];
    } catch (error) {
      console.error("Error parsing dates:", error);
      return [];
    }
  }, [datesData]);

  // Parse the blocked days from the metafield
  const blockedDaysOfWeek = useMemo(() => {
    if (!blockedDaysData || blockedDaysData.length === 0) return [];

    try {
      // Parse the JSON string from the metafield value
      const blockedDaysValue = blockedDaysData[0]?.metafield?.value;
      if (typeof blockedDaysValue === 'string') {
        return JSON.parse(blockedDaysValue);
      }
      return [];
    } catch (error) {
      console.error("Error parsing blocked days:", error);
      return [];
    }
  }, [blockedDaysData]);

  const disabledDates = useMemo(() => {
    const dates = [
      ...blockedDaysOfWeek, 
      { end: dateHelpers.yesterday.toISOString().split('T')[0] }
    ];

    blockedDates.forEach((disabledDate) => {
      dates.push({
        start: new Date(disabledDate.start).toISOString().split('T')[0],
        end: new Date(disabledDate.end).toISOString().split('T')[0]
      });
    });
    
    return dates;
  }, [blockedDaysOfWeek, blockedDates, dateHelpers.yesterday]);

  const formatDisplayDate = useCallback((dateString: string) => {
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }, []);

  const handleDateChange = useCallback((dates: SelectedDate) => {
    if (Array.isArray(dates) && dates.length === 0) {
      applyMetafieldsChange({
        type: 'removeMetafield',
        namespace: 'custom',
        key: 'delivery_date',
      });
      setSelectedDate([]);
      setShowConfirmation(false);
      return;
    }

    let processedDates: string[] = [];
    
    if (Array.isArray(dates)) {
      processedDates = dates.filter(date => typeof date === 'string' && date.length > 0);
    } else if (typeof dates === 'string' && dates.length > 0) {
      processedDates = [dates];
    }
    
    const singleDate = processedDates.length > 0 ? [processedDates[processedDates.length - 1]] : [];

    setSelectedDate(singleDate);

    if (singleDate.length > 0) {
      applyMetafieldsChange({
        type: 'updateMetafield',
        namespace: 'custom',
        key: 'delivery_date',
        valueType: 'string',
        value: singleDate[0],
      });
      setShowConfirmation(true);
    }
  }, [applyMetafieldsChange]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (canBlockProgress && !deliveryDateMetafield?.value) {
      return {
        behavior: 'block',
        reason: 'Delivery date not set',
        errors: [{message: 'Please select a delivery date before proceeding with your order.'}],
      };
    }
    return { behavior: 'allow' };
  });

  return (
    <View border="base" cornerRadius="base" padding="base">
      <BlockStack spacing="base">
        <Heading>Choose your delivery date</Heading>
        <Text>Delivery dates are based on the merchant's availability settings.</Text>

        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          yearMonth={dateHelpers.currentYearMonth}
          disabled={disabledDates}
        />

        {showConfirmation && selectedDate.length > 0 && (
          <Banner status="success" onDismiss={() => setShowConfirmation(false)}>
            Delivery date set for {formatDisplayDate(selectedDate[0])}
          </Banner>
        )}
      </BlockStack>
    </View>
  );
}
