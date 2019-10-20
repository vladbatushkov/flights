using System;
using System.IO;
using System.Linq;

namespace FlightsScheduleGenerator
{
    class Airline
    {
        public string Id { get; private set; }
        public string Code { get; private set; }
        public string Country { get; private set; }
        public decimal PriceX { get; private set; }

        public static Airline Create(string id, string code, string country, decimal priceX)
            => new Airline
            {
                Id = id,
                Code = code,
                Country = country,
                PriceX = priceX                
            };
    }

    class Airport
    {
        public string Id { get; private set; }
        public string Code { get; private set; }
        public string Country { get; private set; }

        public static Airport Create(string id, string code, string country)
            => new Airport
            {
                Id = id,
                Code = code,
                Country = country
            };
    }

    class Route
    {
        public string From { get; private set; }
        public string To { get; private set; }

        public static Route Create(string from, string to)
            => new Route
            {
                From = from,
                To = to
            };
    }

    class Program
    {
        private const string pathSchedule = "../import/schedule_{0}.csv";

        private const string pathRoutes = "../../../../import/routes.csv";
        private const string pathAirlines = "../../../../import/airlines.csv";
        private const string pathAirports = "../../../../import/airports.csv";

        private static readonly DateTime from = DateTime.Parse("2019-11-01");
        private static readonly DateTime to = DateTime.Parse("2019-11-03");
        private const decimal costPerKm = 1.0m; // US dollar

        static void Main(string[] args)
        {
            var routes = File.ReadAllLines(pathRoutes)
                .Skip(1)
                .Select(x => x.Split(","))
                .Select(x => Route.Create(x[0], x[2]))
                .ToArray();

            var airlines = File.ReadAllLines(pathAirlines)
                .Skip(1)
                .Select(x => x.Split(","))
                .Select(x => Airline.Create(x[0], x[2], x[3], Convert.ToDecimal(x[4])))
                .ToArray();

            var airports = File.ReadAllLines(pathAirports)
                .Skip(1)
                .Select(x => x.Split(","))
                .Select(x => Airport.Create(x[0], x[2], x[3]))
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
