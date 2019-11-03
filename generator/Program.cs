using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace FlightsGenerator
{
    public enum Types
    {
        None = 0,
        Node,
        Relationship
    }

    #region Nodes

    public class Airline : IEquatable<Airline>
    {
        public const string File = "airlines.csv";
        public static string Header = "code:ID,name:STRING,country:STRING";

        private const string lco = "Lowcoster";
        private const string ord = "Ordinary";

        public string Name { get; private set; }
        public string Code { get; private set; }
        public string Country { get; private set; }
        public double PriceX { get; private set; }

        public static Airline Create(string name, string code, string country)
            => new Airline
            {
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

        public bool Equals(Airline other)
            => Code == other.Code;
        public override int GetHashCode()
            => Code.GetHashCode();
    }

    public class Airport
    {
        public static string File = "airports.csv";
        public static string Header = "code:ID,name:STRING,country:STRING,city:STRING,location:POINT,utc_offset:FLOAT";

        public string Name { get; private set; }
        public string Code { get; private set; }
        public string Country { get; private set; }
        public string City { get; private set; }
        public (double lati, double longi) Location { get; private set; }
        public string LocationJSON => $"\"{{latitude:{Location.lati}, longitude:{Location.longi}}}\"";
        public short OffsetUTC { get; private set; }

        public static Airport Create(string name, string code, string country, string city, double lati, double longi, short offsetUTC)
            => new Airport
            {
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

    public class Flight<TAirport, TAirline> : IEquatable<Flight<TAirport, TAirline>>
    {
        public static string FileRoutes = "routes.csv";
        public static string FileFlightsHeader() => string.Format($"flights_header.csv");
        public static string FileFlights(DateTime day) => string.Format($"flights_data_{day.ToString("yyyMMdd")}.csv");
        public static string Header => "flightNumber:ID,departs:TIME,duration:STRING,distance:INT,price:INT";

        private const double basePricePerKm = 2.0d;

        public TAirline Airline { get; private set; }
        public string FlightNumber => $"{Airline}_{From}_{To}";
        public double Price => Math.Round((Airline is Airline airline) ? airline.PriceX * Distance * basePricePerKm * (1d + (new Random().Next(0, 3) / 10d)) : 0d, 0);
        public string Duration
            => ConvertDuration(TimeSpan.FromHours(Math.Round((Airline is Airline airline) ? Distance / (airline.PriceX * 800) : 0d, 2)));
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
                Departs = $"{new Random().Next(0, 24).ToString("D2")}" +
                            $"{new Random().Next(0, 59).ToString("D2")}" +
                            $"00.000{(Offset(from is Airport f ? f : null))}"
            };

        private static string ConvertDuration(TimeSpan timeSpan)
            => $"P{timeSpan.Hours.ToString("D2")}H{timeSpan.Minutes.ToString("D2")}M";

        private static string Offset(Airport airport)
            => airport != null ? $"{(airport.OffsetUTC > 0 ? "+" : "-")}{Math.Abs(airport.OffsetUTC).ToString("D2")}00" : string.Empty;

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
            => string.Join(',', new[] { $"{f.FlightNumber}_{day.ToString("yyyMMdd")}", f.Departs, f.Duration.ToString(), f.Distance.ToString(), f.Price.ToString() });

        public bool Equals(Flight<TAirport, TAirline> other)
            => FlightNumber == other.FlightNumber;

        public override int GetHashCode()
            => FlightNumber.GetHashCode();
    }

    public class AirportDay
    {
        public static string FileHeader() => string.Format($"airportDay_header.csv");
        public static string File(DateTime day) => string.Format($"airportDay_data_{day.ToString("yyyyMMdd")}.csv");

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
        public static string Header => ":START_ID,distance:INT,:END_ID";
        public static string MapRow(Flight<Airport, Airline> f) => string.Join(',', new[] { f.From.Code, f.Distance.ToString(), f.To.Code });
    }

    public class HasDay
    {
        public static string FileHeader() => string.Format($"hasDay_header.csv");
        public static string File(DateTime day) => string.Format($"hasDay_data_{day.ToString("yyyyMMdd")}.csv");
        public static string Header => ":START_ID,:END_ID";
        public static Func<Airport, string> MapRow(DateTime day)
            => (Airport a)
            => string.Join(',', new[] { a.Code, AirportDay.Create(a, day).Code });
    }

    public class InFlight
    {
        public static string FileHeader() => string.Format($"inFlight_header.csv");
        public static string File(DateTime day) => string.Format($"inFlight_data_{day.ToString("yyyyMMdd")}.csv");
        public static string Header => ":START_ID,:END_ID,:TYPE";
        public static Func<Flight<Airport, Airline>, string> MapRow(DateTime day)
            => (Flight<Airport, Airline> a)
            => string.Join(',', new[] { AirportDay.Create(a.From, day).Code, $"{a.FlightNumber}_{day.ToString("yyyyMMdd")}", $"{a.From.Code}_FLIGHT" });
    }

    public class OutFlight
    {
        public static string FileHeader() => string.Format($"outFlight_header.csv");
        public static string File(DateTime day) => string.Format($"outFlight_data_{day.ToString("yyyyMMdd")}.csv");
        public static string Header => ":START_ID,:END_ID,:TYPE";
        public static Func<Flight<Airport, Airline>, string> MapRow(DateTime day)
            => (Flight<Airport, Airline> a)
            => string.Join(',', new[] { $"{a.FlightNumber}_{day.ToString("yyyyMMdd")}", AirportDay.Create(a.To, day).Code, $"{a.From.Code}_FLIGHT" });
    }

    public static class OperatedBy
    {
        public static string FileHeader() => string.Format($"operatedBy_header.csv");
        public static string File(DateTime day) => string.Format($"operatedBy_data_{day.ToString("yyyyMMdd")}.csv");
        public static string Header => ":START_ID,:END_ID";
        public static Func<Flight<Airport, Airline>, string> MapRow(DateTime day)
            => (Flight<Airport, Airline> f)
            => string.Join(',', new[] { $"{f.FlightNumber}_{day.ToString("yyyyMMdd")}", f.Airline.Code });
    }

    #endregion

    public class Program
    {
        private const string dataFolder = "./data/";
        private const string importFolder = "./import/";
        private const string moveFolder = "../../../../neo4j-flights/import/";

        private const string fileLog = "log.txt";

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
            var runner = new Runner();
            runner.Run(args);
        }

        public class Runner
        {
            private readonly DateTime fromDate = DateTime.Parse("2019-11-01");
            private readonly DateTime toDate = DateTime.Parse("2019-12-01");

            private StreamWriter logWriter;

            private volatile int countNodes;
            private volatile int countRelationships;

            public void Run(string[] args)
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
                            .Where(x => x.Length > 7 && !string.IsNullOrWhiteSpace(x[3]) && x[3] != "-" && x[7] == "Y")
                            .Select(x => tryToMap(x, y => Airline.Create(y[1], y[3], y[6])))
                            .Where(x => x != null)
                            .Distinct()
                            .ToDictionary(x => x.Code, x => x);

                    IDictionary<string, Airport> sourceAirports()
                        => File.ReadAllLines(dataFolder + Airport.File)
                            .Skip(1)
                            .Select(split)
                            .Where(x => x.Length > 9 && !string.IsNullOrWhiteSpace(x[4]))
                            .Select(x => tryToMap(x, y => Airport.Create(y[1], y[4], y[3], y[2], Convert.ToDouble(y[6]), Convert.ToDouble(y[7]), Convert.ToInt16(y[9]))))
                            .Where(x => x != null)
                            .ToDictionary(x => x.Code, x => x);

                    IEnumerable<Flight<string, string>> sourceRoutes()
                        => File.ReadAllLines(dataFolder + Flight<string, string>.FileRoutes)
                            .Skip(1)
                            .Select(split)
                            .Where(x => x.Length > 4 && !string.IsNullOrWhiteSpace(x[2]) && !string.IsNullOrWhiteSpace(x[4]))
                            .Select(x => tryToMap(x, y => Flight<string, string>.Create($"{y[0]}", $"{y[2]}", $"{y[4]}")))
                            .Where(x => x != null)
                            .ToList();

                    IEnumerable<Flight<Airport, Airline>> sourceFlights(
                        IDictionary<string, Airline> airlines,
                        IDictionary<string, Airport> airports,
                        IEnumerable<Flight<string, string>> routes
                        )
                    {
                        var result = new HashSet<Flight<Airport, Airline>>();
                        foreach (var route in routes)
                        {
                            if (airlines.TryGetValue(route.Airline, out var airline)
                                && airports.TryGetValue(route.From, out var from)
                                && airports.TryGetValue(route.To, out var to))
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
                        => str.Split(",", StringSplitOptions.RemoveEmptyEntries)
                                .Select(y => y.Replace("\"", "").Replace("\\N", "")).ToArray();

                    void write<T>(IEnumerable<T> items, string file, string header, Func<T, string> mapRow, Types type = Types.None)
                    {
                        var path = importFolder + file;
                        var count = 0;
                        using (var fileWriter = new StreamWriter(path))
                        {
                            if (!string.IsNullOrEmpty(header))
                            {
                                fileWriter.WriteLine(header);
                            }
                            foreach (var item in items)
                            {
                                fileWriter.WriteLine(mapRow(item));
                                count++;
                            }
                            switch (type)
                            {
                                case Types.Node:
                                    countNodes += count;
                                    log($"File {path} of {count} node items generated");
                                    break;
                                case Types.Relationship:
                                    countRelationships += count;
                                    log($"File {path} of {count} relationship items generated");
                                    break;
                                default:
                                    log($"File {path} generated");
                                    break;
                            }
                        }
                    }

                    logWriter = new StreamWriter(importFolder + fileLog, true);
                    log($"Files generation started");

                    Parallel.Invoke(
                        () =>
                        {
                            airlineCache = sourceAirlines();
                            write(airlineCache.Values, Airline.File, Airline.Header, Airline.MapRow, Types.Node);
                        },
                        () =>
                        {
                            airportCache = sourceAirports();
                            write(airportCache.Values, Airport.File, Airport.Header, Airport.MapRow, Types.Node);
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
                            write(flightsCache.Distinct(AirportEquals.Create()), FliesTo.File, FliesTo.Header, FliesTo.MapRow, Types.Relationship);
                        },
                        () =>
                        {
                            write(new object[] { }, AirportDay.FileHeader(), AirportDay.Header, (x) => string.Empty);
                            write(new object[] { }, Flight<string, string>.FileFlightsHeader(), Flight<string, string>.Header, (x) => string.Empty);
                            foreach (var day in days)
                            {
                                write(airportCache.Select(x => AirportDay.Create(x.Value, day)), AirportDay.File(day), string.Empty, AirportDay.MapRow, Types.Node);
                                write(flightsCache.Distinct(FlightEquals.Create()), Flight<string, string>.FileFlights(day), string.Empty, Flight<string, string>.MapRow(day), Types.Node);
                            }
                        },
                        () =>
                        {
                            write(new object[] { }, HasDay.FileHeader(), HasDay.Header, (x) => string.Empty);
                            write(new object[] { }, InFlight.FileHeader(), InFlight.Header, (x) => string.Empty);
                            write(new object[] { }, OutFlight.FileHeader(), OutFlight.Header, (x) => string.Empty);
                            write(new object[] { }, OperatedBy.FileHeader(), OperatedBy.Header, (x) => string.Empty);
                            foreach (var day in days)
                            {
                                write(airportCache.Values, HasDay.File(day), string.Empty, HasDay.MapRow(day), Types.Relationship);
                                write(flightsCache, InFlight.File(day), string.Empty, InFlight.MapRow(day), Types.Relationship);
                                write(flightsCache, OutFlight.File(day), string.Empty, OutFlight.MapRow(day), Types.Relationship);
                                write(flightsCache, OperatedBy.File(day), string.Empty, OperatedBy.MapRow(day), Types.Relationship);
                            }
                        }
                    );

                    log($"Files generation finished");
                    log($"Total {countNodes} node items generated");
                    log($"Total {countRelationships} relationship items generated");
                    logWriter.Close();

                    if (Directory.Exists(moveFolder))
                    {
                        Directory.Delete(moveFolder, true);
                    }
                    Directory.Move(importFolder, moveFolder);
                    Console.WriteLine($"Folder {importFolder} moved to {moveFolder}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                finally
                {
                    if (logWriter != null)
                    {
                        logWriter.Close();
                    }
                    Console.ReadKey();
                }
            }
        }

        public class AirportEquals : IEqualityComparer<Flight<Airport, Airline>>
        {
            public bool Equals(Flight<Airport, Airline> x, Flight<Airport, Airline> y)
                => x.From.Code == y.From.Code && x.To.Code == y.To.Code;

            public int GetHashCode(Flight<Airport, Airline> obj)
                => (obj.From.Code + obj.To.Code).GetHashCode();

            public static AirportEquals Create()
                => new AirportEquals();
        }

        public class FlightEquals : IEqualityComparer<Flight<Airport, Airline>>
        {
            public bool Equals(Flight<Airport, Airline> x, Flight<Airport, Airline> y)
                => x.FlightNumber == y.FlightNumber && x.FlightNumber == y.FlightNumber;

            public int GetHashCode(Flight<Airport, Airline> obj)
                => obj.FlightNumber.GetHashCode();

            public static FlightEquals Create()
                => new FlightEquals();
        }
    }
}