using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace FlightsScheduleGenerator
{
    public class Airline
    {
        private const string lco = "Lowcoster";
        private const string ord = "Ordinary";

        public string Id { get; private set; }
        public string Name { get; private set; }
        public string Type { get; private set; }
        public string Code { get; private set; }
        public string Country { get; private set; }
        public double PriceX { get; private set; }

        public static Airline Create(string id, string name, string code, string country)
        {
            var type = new Random().Next(1, 10) == 10 ? lco : ord;
            return new Airline
            {
                Id = $"airline_{id}",
                Name = name,
                Code = code,
                Country = country,
                Type = type,
                PriceX = GetPriceX(type)
            };
        }

        private static double GetPriceX(string type)
        {
            (int min, int max) = type == lco ? (70, 75) : (80, 100);
            return (double)new Random().Next(min, max) / 100;
        }

        public override string ToString()
            => Code;
    }

    public class Airport
    {
        public string Id { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public string Country { get; private set; }
        public string City { get; private set; }
        public (double lati, double longi) Location { get; private set; }

        public static Airport Create(string id, string name, string code, string country, string city, double lati, double longi)
            => new Airport
            {
                Id = $"airport_{id}",
                Name = name,
                Code = code,
                Country = country,
                City = city,
                Location = (lati, longi)
            };

        public override string ToString()
            => Code;
    }

    public class Flight<TAirport, TAirline>
    {
        private const double basePricePerKm = 20.0d;
        private const string dateFormat = "yyyyMMdd";

        public DateTime Date { get; private set; }
        public TAirline Airline { get; private set; }
        public string FlightsNo => $"{Airline}_{From}_{To}";
        public double Price => (Airline is Airline airline) ? airline.PriceX * Distance * basePricePerKm : 0d;
        public double Time => (Airline is Airline airline) ? Distance / airline.PriceX * 1000 : 0d;
        public TAirport From { get; private set; }
        public string FromCode => $"{From}_{Date.ToString(dateFormat)}";
        public TAirport To { get; private set; }
        public string ToCode => $"{To}_{Date.ToString(dateFormat)}";
        public double Distance => (From is Airport from && To is Airport to) ? GetDistance(from, to) : 0d;

        public static Flight<TAirport, TAirline> Create(DateTime date, TAirline airline, TAirport from, TAirport to)
            => new Flight<TAirport, TAirline>
            {
                Date = date,
                Airline = airline,
                From = from,
                To = to
            };

        private static readonly Dictionary<string, double> DistanceCache = new Dictionary<string, double>();

        private static double GetDistance(Airport from, Airport to)
        {
            var cacheKey = $"{from.Code}_{to.Code}";
            if (DistanceCache.TryGetValue(cacheKey, out double distance))
            {
                return distance;
            }
            var d1 = from.Location.lati * (Math.PI / 180.0);
            var num1 = from.Location.longi * (Math.PI / 180.0);
            var d2 = to.Location.lati * (Math.PI / 180.0);
            var num2 = to.Location.longi * (Math.PI / 180.0) - num1;
            var d3 = Math.Pow(Math.Sin((d2 - d1) / 2.0), 2.0) + Math.Cos(d1) * Math.Cos(d2) * Math.Pow(Math.Sin(num2 / 2.0), 2.0);
            distance = 6376500.0 * (2.0 * Math.Atan2(Math.Sqrt(d3), Math.Sqrt(1.0 - d3))) / 1000;
            DistanceCache[cacheKey] = distance;
            return distance;
        }
    }

    public class Program
    {
        private const string pathSchedule = "./schedule_{0}.csv";

        private const string pathAirlines = "../../../../data/airlines.csv";
        private const string pathAirports = "../../../../data/airports.csv";
        private const string pathRoutes = "../../../../data/routes.csv";

        private static readonly DateTime from = DateTime.Parse("2019-11-01");
        private static readonly DateTime to = DateTime.Parse("2019-11-03");

        /// <summary>
        /// Flights schedule generator
        /// arg1 = date from, "yyyy-MM-dd"
        /// arg2 = date to, "yyyy-MM-dd"
        /// arg3 = country csv, "Thailand,Sweden,Russia"
        /// For all Airlines from this Country create Flights Schedule from every Airport to existed destinations on each day in range.
        /// Price = Distance * 
        /// </summary>
        /// <param name="args"></param>
        static void Main(string[] args)
        {
            var routes = File.ReadAllLines(pathRoutes)
                .Skip(1)
                .Select(x => x.Split(","))
                .Select(x => Flight<string, string>.Create(DateTime.MinValue, x[1], x[3], x[5]))
                .ToArray();

            var airlines = File.ReadAllLines(pathAirlines)
                .Skip(1)
                .Select(x => x.Split(","))
                .Where(x => x[7] == "Y")
                .Select(x => Airline.Create(x[0], x[1], x[3], x[6]))
                .ToArray();

            var airports = File.ReadAllLines(pathAirports)
                .Skip(1)
                .Select(x => x.Split(","))
                .Select(x => { try { return Airport.Create(x[0], x[1], x[4], x[3], x[2], Convert.ToDouble(x[6]), Convert.ToDouble(x[7])); } catch { return null; } })
                .Where(x => x != null)
                .ToDictionary(x => x.Id, x => x);

            string fileName(DateTime dt)
                => string.Format(pathSchedule, dt.ToString("yyyMMdd"));

            var current = from;
            while (current < to)
            {
                using (var writer = new StreamWriter(fileName(current)))
                {
                    writer.WriteAsync($"Nothing yet");
                }
                current = current.AddDays(1);
            }

            Console.WriteLine($"Flights schedule generated!");
        }
    }
}
