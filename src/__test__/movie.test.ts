import request from "supertest";
import app from "../index";
import Movie from "../models/movie";
jest.mock("../models/Movie");
describe("GET /movie/getAllMovie", () => {
  const cookie =
    "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2M4MDNjMjk2NzA5YTlkZDFlOGI4MjkiLCJpYXQiOjE3NDI4Nzk5MDIsImV4cCI6MTc0MzQ4NDcwMn0.XGANXHVrC6sAy6-jpqn_XiUqb7moPUILepl879s1QL0";

    beforeEach(() => {
        jest.clearAllMocks();
      });

  it("should check if user is authenticated or not", async () => {
    const res = await request(app).get("/movie/getAllMovie");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Please Login");
  });

  it("should return a list of movies when authenticated", async () => {
   
    const mockMovies = [
      {
        _id: "1",
        title: "First Movie",
        description: "Description",
        rating: 8.5,
        poster: "poster.jpg",
        languages: ["English"],
        genres: ["Action"],
        releaseDate: "2025-03-20",
        cast: [{ _id: "100", name: "Actor 1" }],
        director: { _id: "201", name: "Director 1" },
      },
      {
        _id: "2",
        title: "Second Movie",
        description: "Description of second movie",
        rating: 8.0,
        poster: "poster.jpg",
        languages: ["English"],
        genres: ["Comedy"],
        releaseDate: "2025-03-25",
        cast: [{ _id: "200", name: "Actor 2" }],
        director: { _id: "300", name: "Director 2" },
      }
    ];

    (Movie.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockMovies),
    });

    // as i added only 2 movie details
    (Movie.countDocuments as jest.Mock).mockResolvedValue(2);

    const res = await request(app)
      .get("/movie/getAllMovie")
      .set("Cookie", cookie);
    //if user authenticated then movie will visible
    expect(res.statusCode).toBe(200);
    expect(res.body.data.movies).toHaveLength(2);
  });

  it("should throw 500 error as some error occured", async() => {
    (Movie.find as jest.Mock).mockImplementation(() => {
        throw new Error("MongoDB query failed");
    });
    const res = await request(app).get("/movie/getAllMovie").set("Cookie", cookie);
    expect(res.statusCode).toBe(500);
  })
});
