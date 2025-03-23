import Series from "../models/series";
import { getSeriesByGenre } from "../controllers/series";

// Unit test: coverse single controller in testing
jest.mock("../models/Series");
describe("get series list by genreId (unit testcase)", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      user: true,
      params: { genre: "1" },
      pagination: { skipDocNumber: 0, limitNumber: 10 },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 400 if user is not logged in", async () => {
    mockRequest.user = null;

    await getSeriesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Access denied, Please login",
    });
  });

  it("should return 400 if pagination values are missing", async () => {
    mockRequest.pagination = null;

    const mockSeriesData = [
      {
        title: "Example Series",
        description: "Test description",
        genres: [1],
        languages: ["English"],
        releaseDate: "2024-01-01",
        rating: 4.5,
        poster: "example.jpg",
      },
    ];

    (Series.aggregate as jest.Mock).mockResolvedValue(mockSeriesData);
    (Series.countDocuments as jest.Mock).mockResolvedValue(20);

    await getSeriesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      metadata: {
        totalSeries: 20,
        currentPage: 1,
        totalPages: 2,
      },
      message: "list of series",
      data: { seriesList: mockSeriesData },
    });
  });

  it("should return 400 if genre ID is invalid", async () => {
    mockRequest.params.genre = "invalid";

    await getSeriesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Genre ID must be a positive integer (≥1)",
    });
  });

  it("should return 200 with empty series list if no series found", async () => {
    (Series.aggregate as jest.Mock).mockResolvedValue([]);

    await getSeriesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "no series available with given genreId",
    });
  });

  it("should return 200 with series list if data is found", async () => {
    const mockSeriesData = [
      {
        title: "Example Series",
        description: "Test description",
        genres: [1],
        languages: ["English"],
        releaseDate: "2024-01-01",
        rating: 4.5,
        poster: "example.jpg",
      },
    ];

    (Series.aggregate as jest.Mock).mockResolvedValue(mockSeriesData);
    (Series.countDocuments as jest.Mock).mockResolvedValue(1);

    await getSeriesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      metadata: {
        totalSeries: 1,
        currentPage: 1,
        totalPages: 1,
      },
      message: "list of series",
      data: { seriesList: mockSeriesData },
    });
  });

  it("should return 500 if an error occurs", async () => {
    (Series.aggregate as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    await getSeriesByGenre(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Database error",
    });
  });
});