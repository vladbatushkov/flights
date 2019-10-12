using System;
using System.IO;

namespace FlightsScheduleGenerator
{
    class Program
    {
        private const string path = "../data/schedule.csv";

        static void Main(string[] args)
        {
            using(var writer = new StreamWriter(path))
            {
                writer.WriteAsync($"Nothing yet");
            }
            Console.WriteLine($"Flights schedule generated!");
        }
    }
}
