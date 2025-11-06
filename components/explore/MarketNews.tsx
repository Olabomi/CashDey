"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ExternalLink, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export default function MarketNews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch("/api/explore/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch news",
        variant: "destructive",
      });
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Financial News</CardTitle>
          <CardDescription>
            Get real-time financial news and market analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for financial news, stocks, economy..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : articles.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold">
                {articles.length} article{articles.length !== 1 ? "s" : ""} found
              </h2>
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(article.publishedAt), "MMM d, yyyy 'at' HH:mm")}
                            <span className="mx-2">•</span>
                            {article.source}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {article.description}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(article.url, "_blank")}
                      >
                        Read More
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No articles found. Try a different search term.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Default State */}
      {!hasSearched && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Searches</CardTitle>
              <CardDescription>Try these popular searches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSearchQuery("Nigerian Stock Market");
                  handleSearch();
                }}
              >
                Nigerian Stock Market
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSearchQuery("Nigerian Economy");
                  handleSearch();
                }}
              >
                Nigerian Economy
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSearchQuery("Cryptocurrency Nigeria");
                  handleSearch();
                }}
              >
                Cryptocurrency
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setSearchQuery("Investment Tips");
                  handleSearch();
                }}
              >
                Investment Tips
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Market News</CardTitle>
              <CardDescription>Stay informed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Search for real-time financial news, market trends, economic updates, and investment
                insights. Get the latest information to make informed financial decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

