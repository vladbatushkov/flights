WITH [[{
  flight: {
    duration: duration("P10H46M"),
    departs: time("12:18:00+07:00")
  },
  stop: [
    {
      utc_offset: 7.0,
      code: "BKK"
    },
    {
      utc_offset: 3.0,
      code: "DME"
    }
  ]
}],[{
  flight: {
    duration: duration("P07H34M"),
    departs: time("02:38:00+07:00")
  },
  stop: [
    {
      utc_offset: 7.0,
      code: "BKK"
    },
    {
      utc_offset: 4.0,
      code: "DXB"
    }
  ]
}
,
{
  flight: {
    duration: duration("P02H39M"),
    departs: time("19:54:00+04:00")
  },
  stop: [
    {
      utc_offset: 4.0,
      code: "DXB"
    },
    {
      utc_offset: 4.0,
      code: "TBS"
    }
  ]
}
,
{
  flight: {
    duration: duration("P02H12M"),
    departs: teime("04:33:00+04:00")
  },
  stop: [
    {
      utc_offset: 4.0,
      code: "TBS"
    },
    {
      utc_offset: 3.0,
      code: "VKO"
    }
  ]
}]] as flights
RETURN flights