export default `query {
  shop {
    id
    datesField: metafield(namespace: "dates", key: "dates") {
      id
      namespace
      key
      value
      type
    }
    blockedDaysField: metafield(namespace: "blockedDays", key: "blockedDays") {
      id
      namespace
      key
      value
      type
    }
  }
}`;