
// ─────────────────────────────────────────────────────────────
// seed-tables.mjs
// Run once from the project root:
//   node seed-tables.mjs
//
// Seeds: tables → seats for all 3 venues
// ─────────────────────────────────────────────────────────────

import { Client, Databases, ID, Query } from "node-appwrite";

const ENDPOINT   = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "6a0b6e510022ee01bc68";
const API_KEY = "standard_cbe3c88aa7f99798bebaa7ef639b7025c4840008515d2a5e79303c9aa9ea00842a82042aa4f9f4212e508936cca5a6f9082476d6dc0831abb99b857fe0d2068a676a37157beb489539418e44b5a131167c891508f17ea7e03683f7a813df11488e576778e4c1ca54204f515744ab39044b109a584851954c3d02e10968cce3f9";       // Appwrite Console → Overview → API Keys
const DB_ID      = "6a0b6ec1001c21b1b640";


const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);
const db = new Databases(client);

const COLLECTIONS = {
  VENUES: "venues",
  TABLES: "tables",
  SEATS:  "seats",
};

// ── Venue layouts ─────────────────────────────────────────────
const layout = [
  { slug: "restaurant", tables: 10, seatsPerTable: 4 },
  { slug: "pool",       tables: 8,  seatsPerTable: 2 },
  { slug: "lobby",      tables: 5,  seatsPerTable: 2 },
];

async function seed() {
  console.log("🌱 Starting table + seat seed...\n");

  for (const venue of layout) {
    // Look up venue by slug
    const res = await db.listDocuments(DB_ID, COLLECTIONS.VENUES, [
      Query.equal("slug", venue.slug),
    ]);
    const venueDoc = res.documents[0];
    if (!venueDoc) {
      console.log(`❌ Venue not found: ${venue.slug} — skipping`);
      continue;
    }
    console.log(`📂 Venue: ${venueDoc.name} (${venueDoc.$id})`);

    for (let t = 1; t <= venue.tables; t++) {
      // Create table
      const table = await db.createDocument(DB_ID, COLLECTIONS.TABLES, ID.unique(), {
        venue_id:     venueDoc.$id,
        table_number: t,
        seat_count:   venue.seatsPerTable,
        is_active:    true,
      });
      console.log(`   🪑 Table ${t} created (${table.$id})`);

      // Create seats for this table
      for (let s = 1; s <= venue.seatsPerTable; s++) {
        await db.createDocument(DB_ID, COLLECTIONS.SEATS, ID.unique(), {
          table_id:    table.$id,
          seat_number: s,
        });
      }
      console.log(`      ✅ ${venue.seatsPerTable} seats added`);
    }
    console.log("");
  }

  console.log("✅ Tables and seats seeded!");
  console.log(`   Restaurant: 10 tables × 4 seats = 40 seats`);
  console.log(`   Pool Side:   8 tables × 2 seats = 16 seats`);
  console.log(`   Lobby Café:  5 tables × 2 seats = 10 seats`);
  console.log(`   Total: 66 seats`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});