using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace FlightsGenerator
{
    #region Nodes

    public class Airline
    {
        public const string File = "airlines.csv";
        public static string Header = "code_iata:ID,name:STRING,country:STRING";

        private const string lco = "Lowcoster";
        private const string ord = "Ordinary";

        public string Id { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public string Country { get; private set; }
        public double PriceX { get; private set; }

        public static Airline Create(string id, string name, string code, string country)
            => new Airline
            {
                Id = $"airline_{id}",
                Name = name,
                Code = code,
                Country = country,
                PriceX = GetPriceX()
            };

        private static double GetPriceX()
        {
            var type = new Random().Next(1, 10) == 10 ? lco : ord;
            (int min, int max) = type == lco ? (70, 75) : (80, 100);
            return (double)new Random().Next(min, max) / 100;
        }

        public override string ToString()
            => Code;

        public static string MapRow(Airline a) => string.Join(',', new[] { a.Code, a.Name, a.Country });
    }

    public class Airport
    {
        public static string File = "airports.csv";
        public static string Header = "code_iata:ID,name:STRING,country:STRING,city:STRING,location:POINT,offset_hours_utc:FLOAT";

        public string Id { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public string Country { get; private set; }
        public string City { get; private set; }
        public (double lati, double longi) Location { get; private set; }
        public string LocationJSON => $"\"{{latitude:{Location.lati}, longitude:{Location.longi}}}\"";
        public short OffsetUTC { get; private set; }

        public static Airport Create(string id, string name, string code, string country, string city, double lati, double longi, short offsetUTC)
            => new Airport
            {
                Id = $"airport_{id}",
                Name = name,
                Code = code,
                Country = country,
                City = city,
                Location = (lati, longi),
                OffsetUTC = offsetUTC
            };

        public override string ToString()
            => Code;

        public static string MapRow(Airport a) => string.Join(',', new[] { a.Code, a.Name, a.Country, a.City, a.LocationJSON, a.OffsetUTC.ToString() });
    }

    public class Flight<TAirport, TAirline>
    {
        public static string FileRoutes = "routes.csv";
        public static string FileFlights(DateTime day) => string.Format($"flights_{day.ToString("yyyMMdd")}.csv");
        public static string Header => "id:ID,code:STRING,departs:STRING,duration:STRING,distance_km:INT,price:INT";

        private const double basePricePerKm = 10.0d; // 20 THB per km, local Motobike price

        public TAirline Airline { get; private set; }
        public string FlightsNo => $"{Airline}_{From}_{To}";
        public double Price => Math.Round((Airline is Airline airline) ? airline.PriceX * Distance * basePricePerKm * (1d + (new Random().Next(0, 3) / 10d)) : 0d, 0);
        public double Duration => Math.Round((Airline is Airline airline) ? Distance / (airline.PriceX * 1000) : 0d, 2);
        public TAirport From { get; private set; }
        public TAirport To { get; private set; }
        public double Distance => (From is Airport from && To is Airport to) ? GetDistance(from, to) : 0d;
        public string Departs { get; private set; }

        public static Flight<TAirport, TAirline> Create(TAirline airline, TAirport from, TAirport to)
            => new Flight<TAirport, TAirline>
            {
                Airline = airline,
                From = from,
                To = to,
                Departs = $"P{new Random().Next(0, 24)}H{new Random().Next(0, 59)}M"
            };

        private static readonly ConcurrentDictionary<string, double> DistanceCache = new ConcurrentDictionary<string, double>();

        private static double GetDistance(Airport from, Airport to)
        {
            var cacheKey = $"{from.Code}_{to.Code}";
            if (DistanceCache.TryGetValue(cacheKey, out double distance))
            {
                return Math.Round(distance, 0);
            }
            var d1 = from.Location.lati * (Math.PI / 180.0);
            var num1 = from.Location.longi * (Math.PI / 180.0);
            var d2 = to.Location.lati * (Math.PI / 180.0);
            var num2 = to.Location.longi * (Math.PI / 180.0) - num1;
            var d3 = Math.Pow(Math.Sin((d2 - d1) / 2.0), 2.0) + Math.Cos(d1) * Math.Cos(d2) * Math.Pow(Math.Sin(num2 / 2.0), 2.0);
            distance = 6376500.0 * (2.0 * Math.Atan2(Math.Sqrt(d3), Math.Sqrt(1.0 - d3))) / 1000;
            DistanceCache[cacheKey] = distance;
            return Math.Round(distance, 0);
        }

        public static Func<Flight<Airport, Airline>, string> MapRow(DateTime day)
            => (Flight<Airport, Airline> f)
            => string.Join(',', new[] { $"{f.FlightsNo}_{day.ToString("yyyMMdd")}", f.FlightsNo, f.Departs, f.Duration.ToString(), f.Distance.ToString(), f.Price.ToString() });
    }

    public class AirportDay
    {
        public static string File(DateTime day) => string.Format($"airportDay_{day.ToString("yyyyMMdd")}.csv");

        public static string Header = "code:ID";

        public string Code { get; private set; }

        public static AirportDay Create(Airport airport, DateTime day)
            => new AirportDay
            {
                Code = $"{airport.Code}_{day.ToString("yyyyMMdd")}"
            };

        public static string MapRow(AirportDay ad) => string.Join(',', new[] { ad.Code });
    }

    #endregion

    #region Relationships

    public static class FliesTo
    {
        public static string File = "fliesTo.csv";
        public static string Header => ":START_ID,distance_km:INT,:END_ID";
        public static string MapRow(Flight<Airport, Airline> f) => string.Join(',', new[] { f.From.Code, f.Distance.ToString(), f.To.Code });
    }

    public class HasDay
    {
        public static string File(DateTime day) => string.Format($"hasDay_{day.ToString("yyyyMMdd")}.csv");
        public static string Header => ":START_ID,:END_ID";
        public static Func<Airport, string> MapRow(DateTime day)
            => (Airport a)
            => string.Join(',', new[] { a.Id, AirportDay.Create(a, day).Code });
    }

    public class InFlight
    {
        public static string File(DateTime day) => string.Format($"inFlight_{day.ToString("yyyyMMdd")}.csv");
        public static string Header => ":START_ID,:END_ID,:TYPE";
        public static Func<Flight<Airport, Airline>, string> MapRow(DateTime day)
            => (Flight<Airport, Airline> a)
            => string.Join(',', new[] { AirportDay.Create(a.From, day).Code, a.FlightsNo, $"{a.From.Code}_FLIGHT" });
    }

    public class OutFlight
    {
        public static string File(DateTime day) => string.Format($"outFlight_{day.ToString("yyyyMMdd")}.csv");
        public static string Header => ":START_ID,:END_ID,:TYPE";
        public static Func<Flight<Airport, Airline>, string> MapRow(DateTime day)
            => (Flight<Airport, Airline> a)
            => string.Join(',', new[] { a.FlightsNo, AirportDay.Create(a.From, day).Code, $"{a.From.Code}_FLIGHT" });
    }

    #endregion

    public class Program
    {
        private const string dataFolder = "./data/";
        private const string importFolder = "./import/";

        private const string fileLog = "log.txt";

        private static readonly DateTime fromDate = DateTime.Parse("2019-11-01");
        private static readonly DateTime toDate = DateTime.Parse("2019-11-03");

        private static StreamWriter logWriter;


        /// <summary>
        /// Flights schedule generator
        /// arg1 = date from, "yyyy-MM-dd"
        /// arg2 = date to, "yyyy-MM-dd"
        /// arg3 = country csv, "Thailand,Sweden,Russia"
        /// For all Airlines from this Country create Flights Schedule from every Airport to existed destinations on each day in range.
        /// </summary>
        /// <param name="args"></param>
        static void Main(string[] args)
        {
            void log(string message)
            {
                Console.WriteLine(message);
                logWriter.WriteLine($"{DateTime.Now.ToLongTimeString()}: {message}");
            }

            try
            {
                IDictionary<string, Airline> airlineCache = null;
                IDictionary<string, Airport> airportCache = null;
                IEnumerable<Flight<string, string>> routeCache = null;
                IEnumerable<Flight<Airport, Airline>> flightsCache = null;

                IDictionary<string, Airline> sourceAirlines()
                    => File.ReadAllLines(dataFolder + Airline.File)
                        .Skip(1)
                        .Select(split)
                        .Where(x => x.Length > 7 && !string.IsNullOrWhiteSpace(x[3]) && x[7] == "Y")
                        .Select(x => tryToMap(x, y => Airline.Create(y[0], y[1], y[3], y[6])))
                        .Where(x => x != null)
                        .ToDictionary(x => x.Id, x => x);

                IDictionary<string, Airport> sourceAirports()
                    => File.ReadAllLines(dataFolder + Airport.File)
                        .Skip(1)
                        .Select(split)
                        .Where(x => x.Length > 9 && !string.IsNullOrWhiteSpace(x[4]))
                        .Select(x => tryToMap(x, y => Airport.Create(y[0], y[1], y[4], y[3], y[2], Convert.ToDouble(y[6]), Convert.ToDouble(y[7]), Convert.ToInt16(y[9]))))
                        .Where(x => x != null)
                        .ToDictionary(x => x.Id, x => x);

                IEnumerable<Flight<string, string>> sourceRoutes()
                    => File.ReadAllLines(dataFolder + Flight<string, string>.FileRoutes)
                        .Skip(1)
                        .Select(split)
                        .Where(x => x.Length > 5 && !string.IsNullOrWhiteSpace(x[3]) && !string.IsNullOrWhiteSpace(x[5]))
                        .Select(x => tryToMap(x, y => Flight<string, string>.Create($"airline_{y[1]}", $"airport_{y[3]}", $"airport_{y[5]}")))
                        .Where(x => x != null)
                        .ToList();

                IEnumerable<Flight<Airport, Airline>> sourceFlights(
                    IDictionary<string, Airline> airlines,
                    IDictionary<string, Airport> airports,
                    IEnumerable<Flight<string, string>> routes
                    )
                {
                    var result = new List<Flight<Airport, Airline>>();
                    foreach (var route in routes)
                    {
                        if (airlines.TryGetValue(route.Airline, out var airline)
                            && airports.TryGetValue(route.From, out var from)
                            && airports.TryGetValue(route.To, out var to)
                            && airline.Country == from.Country) // Only Airline from same Country operate Flights from deaprture Airport
                        {
                            result.Add(Flight<Airport, Airline>.Create(airline, from, to));
                        }
                    }
                    return result;
                }

                T tryToMap<T>(string[] arr, Func<string[], T> map) where T : class
                {
                    try { return map(arr); }
                    catch { return null; }
                }

                string[] split(string str)
                    => str.Split(",", StringSplitOptions.RemoveEmptyEntries).Select(y => y.Replace("\"", "").Replace("\\N", "")).ToArray();

                void write<T>(IEnumerable<T> items, string file, string header, Func<T, string> mapRow)
                {
                    var path = importFolder + file;
                    var count = 0;
                    using (var fileWriter = new StreamWriter(path))
                    {
                        fileWriter.WriteLine(header);
                        foreach (var item in items)
                        {
                            fileWriter.WriteLine(mapRow(item));
                            count++;
                        }
                    }
                    log($"File {path} of {count} items generated!");
                }

                logWriter = new StreamWriter(importFolder + fileLog, true);
                Parallel.Invoke(
                    () =>
                    {
                        airlineCache = sourceAirlines();
                        write(airlineCache.Values, Airline.File, Airline.Header, Airline.MapRow);
                    },
                    () =>
                    {
                        airportCache = sourceAirports();
                        write(airportCache.Values, Airport.File, Airport.Header, Airport.MapRow);
                    },
                    () =>
                    {
                        routeCache = sourceRoutes();
                    }
                );

                var days = from d in Enumerable.Range(0, toDate.Subtract(fromDate).Days) select fromDate.AddDays(d);
                flightsCache = sourceFlights(airlineCache, airportCache, routeCache);
                Parallel.Invoke(
                    () =>
                    {
                        write(flightsCache, FliesTo.File, FliesTo.Header, FliesTo.MapRow);
                    },
                    () =>
                    {
                        foreach (var day in days)
                        {
                            write(airportCache.Select(x => AirportDay.Create(x.Value, day)), AirportDay.File(day), AirportDay.Header, AirportDay.MapRow);
                            write(flightsCache, Flight<string, string>.FileFlights(day), Flight<string, string>.Header, Flight<string, string>.MapRow(day));
                        }
                    },
                    () =>
                    {
                        foreach (var day in days)
                        {
                            write(airportCache.Values, HasDay.File(day), HasDay.Header, HasDay.MapRow(day));
                            write(flightsCache, InFlight.File(day), InFlight.Header, InFlight.MapRow(day));
                            write(flightsCache, OutFlight.File(day), OutFlight.Header, OutFlight.MapRow(day));
                        }
                    }
                );

                log($"Flights import generated!");
                logWriter.Close();
            }
            catch (Exception ex)
            {
                log(ex.Message);
            }
            finally
            {
                Console.ReadKey();
            }
        }
    }
}