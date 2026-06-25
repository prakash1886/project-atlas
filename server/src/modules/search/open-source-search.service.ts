import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OpenSourceSearchService {
  private readonly logger = new Logger(OpenSourceSearchService.name);
  private readonly contactEmail = process.env.CONTACT_EMAIL || 'engineering@projectatlas.io';
  private readonly userAgent = `ProjectAtlas/1.0 (mailto:${this.contactEmail})`;
  
  // Trefle API token (optional, for specialized Botany data)
  private readonly trefleToken = process.env.TREFLE_API_TOKEN;

  // NASA API Key (falls back to DEMO_KEY)
  private readonly nasaKey = process.env.NASA_API_KEY || 'DEMO_KEY';

  // Simple delay utility to enforce rate-limiting
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 1. Wikipedia Pageviews (SYS-POLICY compliant User-Agent)
   */
  async getPageviews(article: string, daysAgo = 30): Promise<number> {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysAgo);

    const formatOffsetDate = (d: Date) => d.toISOString().replace(/[-T:]/g, '').split('.')[0].slice(0, 8);
    const startStr = formatOffsetDate(startDate);
    const endStr = formatOffsetDate(today);
    
    const formattedArticle = encodeURIComponent(article.replace(/ /g, '_'));
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${formattedArticle}/daily/${startStr}/${endStr}`;

    try {
      const response = await fetch(url, { headers: { 'User-Agent': this.userAgent } });
      if (!response.ok) throw new Error(`Wikimedia API responded with ${response.status}`);
      const data: any = await response.json();
      return (data?.items ?? []).reduce((acc: number, item: any) => acc + (item.views ?? 0), 0);
    } catch (e: any) {
      this.logger.error(`[Wikimedia] Failed pageviews for "${article}": ${e.message}`);
      return 0;
    }
  }

  /**
   * 2. Wikidata SPARQL Query (Enforces 1 request/sec rate limit)
   */
  async queryWikidata(sparql: string): Promise<any[]> {
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
    
    try {
      // Respectful pacing: wait 1 second to safeguard against 429s
      await this.delay(1000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/sparql-results+json',
        },
      });

      if (!response.ok) throw new Error(`Wikidata SPARQL query failed with status: ${response.status}`);
      const data: any = await response.json();
      return data?.results?.bindings ?? [];
    } catch (e: any) {
      this.logger.error(`[Wikidata] SPARQL query failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 3. OpenAlex Literature Search (Routes into "Polite Pool")
   */
  async searchOpenAlex(query: string, limit = 5): Promise<any[]> {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=${limit}&mailto=${encodeURIComponent(this.contactEmail)}`;

    try {
      const response = await fetch(url, { headers: { 'User-Agent': this.userAgent } });
      if (!response.ok) throw new Error(`OpenAlex responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.results ?? [];
    } catch (e: any) {
      this.logger.error(`[OpenAlex] Search failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 4. GDELT v2 Document Search
   */
  async searchGDELT(query: string, limit = 10): Promise<any[]> {
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=Articles&format=JSON&maxrecords=${limit}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`GDELT responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.articles ?? [];
    } catch (e: any) {
      this.logger.error(`[GDELT] Search failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 5. DBpedia SPARQL Query
   */
  async queryDBpedia(sparql: string): Promise<any[]> {
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;

    try {
      // Pacing to avoid overloading DBpedia public SPARQL endpoints
      await this.delay(500);

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/sparql-results+json',
        },
      });

      if (!response.ok) throw new Error(`DBpedia SPARQL query failed with status: ${response.status}`);
      const data: any = await response.json();
      return data?.results?.bindings ?? [];
    } catch (e: any) {
      this.logger.error(`[DBpedia] SPARQL query failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 6. Open Library Book & Metadata Search
   */
  async searchOpenLibrary(query: string, limit = 5): Promise<any[]> {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (!response.ok) throw new Error(`Open Library responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.docs ?? [];
    } catch (e: any) {
      this.logger.error(`[OpenLibrary] Search failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 7. Gutendex (Project Gutenberg eBook Search)
   */
  async searchGutendex(query: string): Promise<any[]> {
    const url = `https://gutendex.com/books/?search=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Gutendex responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.results ?? [];
    } catch (e: any) {
      this.logger.error(`[Gutendex] Search failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 8. PLOS (Public Library of Science) Literature Search
   */
  async searchPLOS(query: string, limit = 5): Promise<any[]> {
    const url = `https://api.plos.org/search?q=${encodeURIComponent(query)}&rows=${limit}&wt=json`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`PLOS responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.response?.docs ?? [];
    } catch (e: any) {
      this.logger.error(`[PLOS] Search failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 9. EOL (Encyclopedia of Life) Species Search
   */
  async searchEOL(query: string): Promise<any[]> {
    const url = `https://eol.org/api/search/1.0.json?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });
      if (!response.ok) throw new Error(`EOL Search responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.results ?? [];
    } catch (e: any) {
      this.logger.error(`[EOL] Search failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 10. EOL Species Pages Data
   */
  async getEOLPage(id: number): Promise<any> {
    const url = `https://eol.org/api/pages/1.0/${id}.json?images=5&text=5&details=true&common_names=true`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });
      if (!response.ok) throw new Error(`EOL Page responded with status: ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.error(`[EOL] Page retrieval failed for ID ${id}: ${e.message}`);
      return null;
    }
  }

  /**
   * 11. GBIF (Global Biodiversity Information Facility) Species Search
   */
  async searchGBIF(query: string, limit = 5): Promise<any[]> {
    const url = `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(query)}&limit=${limit}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`GBIF responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.results ?? [];
    } catch (e: any) {
      this.logger.error(`[GBIF] Search failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 12. Xeno-Canto Bird & Wildlife Audio Search
   */
  async searchXenoCanto(query: string): Promise<any[]> {
    const url = `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Xeno-Canto responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.recordings ?? [];
    } catch (e: any) {
      this.logger.error(`[Xeno-Canto] Search failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 13. Trefle (Specialized Botany API) Search
   */
  async searchTrefle(query: string, limit = 5): Promise<any[]> {
    if (!this.trefleToken) {
      this.logger.warn(`[Trefle] Token missing. Skipping search for "${query}".`);
      return [];
    }
    const url = `https://trefle.io/api/v1/species/search?q=${encodeURIComponent(query)}&limit=${limit}&token=${this.trefleToken}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Trefle responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.data ?? [];
    } catch (e: any) {
      this.logger.error(`[Trefle] Search failed: ${e.message}`);
      return [];
    }
  }

  /**
   * 14. Trefle Species Traits lookup
   */
  async getTrefleSpecies(id: number): Promise<any> {
    if (!this.trefleToken) {
      this.logger.warn(`[Trefle] Token missing. Skipping lookup for ID ${id}.`);
      return null;
    }
    const url = `https://trefle.io/api/v1/species/${id}?token=${this.trefleToken}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Trefle Species responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.data ?? null;
    } catch (e: any) {
      this.logger.error(`[Trefle] Species lookup failed for ID ${id}: ${e.message}`);
      return null;
    }
  }

  /**
   * 15. NASA Image and Video Library Search (Cosmos)
   */
  async searchNASA(query: string): Promise<any[]> {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`NASA Image Library responded with status: ${response.status}`);
      const data: any = await response.json();
      const items = data?.collection?.items ?? [];
      
      return items.slice(0, 10).map((item: any) => ({
        title: item.data?.[0]?.title ?? 'NASA Image',
        description: item.data?.[0]?.description ?? '',
        imageUrl: item.links?.[0]?.href ?? '',
        nasaId: item.data?.[0]?.nasa_id ?? '',
        dateCreated: item.data?.[0]?.date_created ?? '',
      }));
    } catch (e: any) {
      this.logger.error(`[NASA] Search failed for "${query}": ${e.message}`);
      return [];
    }
  }

  /**
   * 16. NASA Astronomy Picture of the Day (APOD)
   */
  async getNASAApod(): Promise<any> {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${this.nasaKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`NASA APOD responded with status: ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.error(`[NASA APOD] Retrieval failed: ${e.message}`);
      return null;
    }
  }

  /**
   * 17. REST Countries search (Geography)
   */
  async searchCountry(name: string): Promise<any[]> {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`REST Countries search responded with status: ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.error(`[REST Countries] Search failed for "${name}": ${e.message}`);
      return [];
    }
  }

  /**
   * 18. REST Countries data lookup by country alpha code
   */
  async getCountryData(code: string): Promise<any> {
    const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`REST Countries lookup responded with status: ${response.status}`);
      const data = await response.json();
      return data?.[0] ?? null;
    } catch (e: any) {
      this.logger.error(`[REST Countries] Lookup failed for code "${code}": ${e.message}`);
      return null;
    }
  }

  /**
   * 19. Macrostrat Geologic Map Data by Coordinate (Geology / Rock Stratigraphy)
   */
  async getGeologyAtPoint(lat: number, lng: number): Promise<any[]> {
    const url = `https://macrostrat.org/api/v2/geologic_units/map?lat=${lat}&lng=${lng}&response=long`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Macrostrat responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.success?.data ?? [];
    } catch (e: any) {
      this.logger.error(`[Macrostrat] Geological lookup failed at point (${lat}, ${lng}): ${e.message}`);
      return [];
    }
  }

  /**
   * 20. USGS Historical & Real-Time Earthquake Search (Tectonics & Faults)
   */
  async searchUSGSEarthquakes(lat: number, lng: number, maxRadiusKm = 250): Promise<any[]> {
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lng}&maxradiuskm=${maxRadiusKm}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`USGS Earthquakes responded with status: ${response.status}`);
      const data: any = await response.json();
      const features = data?.features ?? [];
      
      return features.slice(0, 10).map((f: any) => ({
        magnitude: f.properties?.mag ?? 0,
        place: f.properties?.place ?? '',
        time: f.properties?.time ? new Date(f.properties.time).toISOString() : '',
        coordinates: f.geometry?.coordinates ?? [],
        tsunami: f.properties?.tsunami ?? 0,
      }));
    } catch (e: any) {
      this.logger.error(`[USGS] Earthquake search failed at (${lat}, ${lng}): ${e.message}`);
      return [];
    }
  }

  /**
   * 21. OpenStreetMap Overpass API (Physical Features search: peaks, rivers, canyons, volcanoes)
   */
  async searchOverpassPhysicalFeature(name: string, type: 'peak' | 'river' | 'volcano'): Promise<any[]> {
    const url = `https://overpass-api.de/api/interpreter`;
    
    let osmQuery = '';
    if (type === 'peak') {
      osmQuery = `[out:json];node["natural"="peak"]["name"~"${name}",i];out;`;
    } else if (type === 'river') {
      osmQuery = `[out:json];way["waterway"="river"]["name"~"${name}",i];out geom;`;
    } else if (type === 'volcano') {
      osmQuery = `[out:json];node["natural"="volcano"]["name"~"${name}",i];out;`;
    } else {
      return [];
    }

    try {
      // Rate pacing for Overpass public server
      await this.delay(500);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(osmQuery)}`,
      });

      if (!response.ok) throw new Error(`Overpass API responded with status: ${response.status}`);
      const data: any = await response.json();
      return data?.elements ?? [];
    } catch (e: any) {
      this.logger.error(`[Overpass] Search failed for "${name}" (type=${type}): ${e.message}`);
      return [];
    }
  }

  /**
   * 22. iNaturalist Observations Search (Citizen science, maps, and Creative Commons images of insects, birds, plants)
   */
  async searchINaturalist(query: string, limit = 10, iconicTaxon?: string): Promise<any[]> {
    let url = `https://api.inaturalist.org/v1/observations?q=${encodeURIComponent(query)}&per_page=${limit}`;
    if (iconicTaxon) {
      url += `&iconic_taxa=${encodeURIComponent(iconicTaxon)}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`iNaturalist responded with status: ${response.status}`);
      const data: any = await response.json();
      const results = data?.results ?? [];

      return results.map((obs: any) => ({
        id: obs.id,
        place: obs.place_guess ?? '',
        observedOn: obs.observed_on ?? '',
        latitude: obs.location?.split(',')?.[0] ?? '',
        longitude: obs.location?.split(',')?.[1] ?? '',
        taxonName: obs.taxon?.name ?? '',
        commonName: obs.taxon?.preferred_common_name ?? '',
        images: (obs.photos ?? []).map((p: any) => p.url?.replace('square', 'large')),
        license: obs.license_code ?? '',
      }));
    } catch (e: any) {
      this.logger.error(`[iNaturalist] Search failed for "${query}" (taxon=${iconicTaxon}): ${e.message}`);
      return [];
    }
  }

  /**
   * 23. MusicBrainz Artist Search (Pop Culture - Music)
   */
  async searchMusicBrainz(artistName: string, limit = 5): Promise<any[]> {
    const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(artistName)}&limit=${limit}&fmt=json`;

    try {
      // MusicBrainz rate limits require standard pacing (1 RPS suggested)
      await this.delay(1000);

      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });

      if (!response.ok) throw new Error(`MusicBrainz responded with status: ${response.status}`);
      const data: any = await response.json();
      const artists = data?.artists ?? [];

      return artists.map((art: any) => ({
        id: art.id,
        name: art.name,
        type: art.type ?? '',
        country: art.country ?? '',
        disambiguation: art.disambiguation ?? '',
        lifeSpanBegin: art['life-span']?.begin ?? '',
        lifeSpanEnd: art['life-span']?.end ?? '',
      }));
    } catch (e: any) {
      this.logger.error(`[MusicBrainz] Artist search failed for "${artistName}": ${e.message}`);
      return [];
    }
  }

  /**
   * 24. TVmaze Show Search (Pop Culture - TV Shows / Movies)
   */
  async searchTVmaze(showName: string): Promise<any[]> {
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(showName)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`TVmaze responded with status: ${response.status}`);
      const data: any = await response.json();
      
      return data.map((entry: any) => ({
        id: entry.show?.id,
        name: entry.show?.name,
        type: entry.show?.type ?? '',
        language: entry.show?.language ?? '',
        genres: entry.show?.genres ?? [],
        status: entry.show?.status ?? '',
        premiered: entry.show?.premiered ?? '',
        summary: entry.show?.summary ?? '',
        imageUrl: entry.show?.image?.original ?? entry.show?.image?.medium ?? '',
      }));
    } catch (e: any) {
      this.logger.error(`[TVmaze] Show search failed for "${showName}": ${e.message}`);
      return [];
    }
  }

  /**
   * 25. Stack Exchange Site Question Search (Forums - Philosophy, History, Literature debates)
   */
  async searchStackExchange(query: string, site = 'philosophy', limit = 5): Promise<any[]> {
    const url = `https://api.stackexchange.org/2.3/search/advanced?q=${encodeURIComponent(query)}&site=${site}&pagesize=${limit}&order=desc&sort=relevance`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Stack Exchange responded with status: ${response.status}`);
      const data: any = await response.json();
      const items = data?.items ?? [];

      return items.map((item: any) => ({
        title: item.title,
        link: item.link,
        score: item.score ?? 0,
        viewCount: item.view_count ?? 0,
        isAnswered: item.is_answered ?? false,
        tags: item.tags ?? [],
      }));
    } catch (e: any) {
      this.logger.error(`[StackExchange] Search failed for "${query}" on site "${site}": ${e.message}`);
      return [];
    }
  }

  /**
   * 26. Discourse Public Forum Latest Topics Fetcher (e.g. forum.effectivealtruism.org, lesswrong.com)
   */
  async getDiscourseLatest(domain: string): Promise<any[]> {
    const url = `https://${domain}/latest.json`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });
      if (!response.ok) throw new Error(`Discourse forum at ${domain} responded with status: ${response.status}`);
      const data: any = await response.json();
      const topics = data?.topic_list?.topics ?? [];

      return topics.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        slug: topic.slug ?? '',
        views: topic.views ?? 0,
        likeCount: topic.like_count ?? 0,
        postsCount: topic.posts_count ?? 0,
        createdAt: topic.created_at ?? '',
        link: `https://${domain}/t/${topic.slug}/${topic.id}`,
      }));
    } catch (e: any) {
      this.logger.error(`[Discourse] Failed to fetch latest topics from ${domain}: ${e.message}`);
      return [];
    }
  }
}
