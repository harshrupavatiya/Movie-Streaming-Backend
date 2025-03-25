import { getMoviesByGenre } from "../controllers/movie";
import Movie from "../models/movie";

jest.mock("../models/Movie");

describe("get movies list by genreId (unit testcase)", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      user: true,
      params: { genre: "35" },
      query: {
        page: "1",
        limit: "10",
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 400 if user is not logged in", async () => {
    mockRequest.user = null;

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Access denied, Please login",
    });
  });

  it("should return 400 if genre parameter is missing", async () => {
    mockRequest.params.genre = null;

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Genre parameter is required.",
    });
  });

  it("should return 400 if genre ID is invalid", async () => {
    mockRequest.params.genre = "invalid";

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Genre ID must be a positive integer (≥1)",
    });
  });

  it("should return 400 if page number is invalid", async () => {
    mockRequest.query.page = "0";

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Page must be a positive integer (≥1)",
    });
  });

  it("should return 400 if limit is invalid", async () => {
    mockRequest.query.limit = "101";

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Limit must be a positive integer (1-100)",
    });
  });

  it("should return 200 with empty movie list if no movies found", async () => {
    (Movie.aggregate as jest.Mock).mockResolvedValue([]);

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "no Movies available with given genreId",
    });
  });

  it("should return 200 with movie list if movies are found", async () => {
    const mockMovieData = [
      {
        _id: "1",
        title: "Test Movie",
        description: "Test description",
        genres: [1],
        languages: ["English"],
        releaseDate: "2024-01-01",
        rating: 4.5,
        poster: "test.jpg",
        availableForStreaming: true,
      },
    ];

    (Movie.aggregate as jest.Mock).mockResolvedValue(mockMovieData);
    (Movie.countDocuments as jest.Mock).mockResolvedValue(1);

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      metadata: {
        totalMovies: 1,
        currentPage: 1,
        totalPages: 1,
      },
      message: "list of Movies",
      data: { moviesList: mockMovieData },
    });
  });

  it("should handle pagination correctly", async () => {
    mockRequest.query.page = "2";
    mockRequest.query.limit = "5";

    const mockMovieData = [
      {
        _id: "1437985773",
        title: "John Wick",
        description: "vfdn vdnnbnvf",
        genres: [1, 35],
        languages: ["English"],
        releaseDate: "2020-08-24",
        rating: 7.8,
        poster: "test.jpg",
        availableForStreaming: true,
      },
    ];

    (Movie.aggregate as jest.Mock).mockResolvedValue(mockMovieData);
    (Movie.countDocuments as jest.Mock).mockResolvedValue(8);

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(Movie.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $skip: 5 }),
        expect.objectContaining({ $limit: 5 }),
      ])
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      metadata: {
        totalMovies: 8,
        currentPage: 2,
        totalPages: 2,
      },
      message: "list of Movies",
      data: { moviesList: mockMovieData },
    });
  });

  it("should return 500 if an error occurs", async () => {
    (Movie.aggregate as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await getMoviesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Database error",
    });
  });
});
