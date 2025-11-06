import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export async function POST(request: NextRequest) {
  let query: string | undefined;
  
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    query = body.query;

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    // For now, we'll use OpenAI to generate realistic news summaries
    // In production, you would integrate with a news API like NewsAPI, Bing News API, etc.
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a financial news assistant. Generate realistic financial news articles based on the user's search query.
          Focus on Nigerian financial markets, economy, investments, and related topics.
          Return a JSON array of 5-8 news articles with the following structure:
          [
            {
              "title": "Article title",
              "description": "Brief summary of the article (2-3 sentences)",
              "url": "https://example.com/article",
              "publishedAt": "ISO date string",
              "source": "News source name"
            }
          ]
          
          Make the articles relevant, realistic, and based on current financial topics. Use Nigerian context when applicable.`,
        },
        {
          role: "user",
          content: `Search query: "${query}"
          
          Generate financial news articles related to this query. Include articles about:
          - Nigerian financial markets
          - Economic news
          - Investment opportunities
          - Personal finance tips
          - Market analysis
          
          Return only valid JSON array, no additional text.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    // Handle both direct array and object with articles property
    let articles: NewsArticle[] = [];
    if (Array.isArray(parsed)) {
      articles = parsed;
    } else if (parsed.articles && Array.isArray(parsed.articles)) {
      articles = parsed.articles;
    } else {
      // Generate a fallback structure
      articles = [
        {
          title: `Financial News: ${query}`,
          description: `Latest updates and analysis on ${query} in the Nigerian financial market.`,
          url: "https://example.com/news",
          publishedAt: new Date().toISOString(),
          source: "Financial News",
        },
      ];
    }

    // Ensure all articles have required fields
    articles = articles.map((article) => ({
      title: article.title || "Untitled Article",
      description: article.description || "No description available.",
      url: article.url || "https://example.com",
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: article.source || "News Source",
    }));

    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error("News API error:", error);
    
    // Return mock data on error (use query from try block or default)
    const fallbackQuery = query || "Market Update";
    const mockArticles: NewsArticle[] = [
      {
        title: `Financial News: ${fallbackQuery}`,
        description: `Latest updates and insights on ${fallbackQuery}. Stay informed with real-time financial news and analysis.`,
        url: "https://example.com/news",
        publishedAt: new Date().toISOString(),
        source: "Financial News",
      },
    ];

    return NextResponse.json({
      articles: mockArticles,
      note: "Using mock data. Please configure a news API for real-time updates.",
    });
  }
}

