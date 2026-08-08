import pymongo
import sys

# ⚠️ PASTE YOUR ACTUAL ATLAS URL WITH YOUR PASSWORD HERE:
ATLAS_URI = "mongodb+srv://admin:Password123@cluster0.ftbbwoc.mongodb.net/mealmate_db"

def migrate():
    print("Connecting to local MongoDB...")
    local_client = pymongo.MongoClient("mongodb://localhost:27017/")
    local_db = local_client["mealmate_db"]

    print("Connecting to Atlas Cloud MongoDB...")
    try:
        remote_client = pymongo.MongoClient(ATLAS_URI)
        remote_db = remote_client["mealmate_db"]
        
        # Test connection
        remote_client.admin.command('ping')
        print("Successfully connected to Atlas!")
    except Exception as e:
        print("FAILED to connect to Atlas. Did you replace '<db_password>' with your real password?")
        print(f"Error details: {e}")
        sys.exit(1)

    collections = local_db.list_collection_names()
    print(f"Found {len(collections)} collections to transfer.")

    for coll_name in collections:
        local_data = list(local_db[coll_name].find())
        if not local_data:
            continue
            
        print(f"Transferring {coll_name} ({len(local_data)} records)...")
        
        # Drop the remote collection if it exists to avoid duplicate data crashes during multiple attempts
        remote_db[coll_name].drop() 
        
        # Insert to Atlas
        remote_db[coll_name].insert_many(local_data)
        
    print("MIGRATION COMPLETE! Your cloud database is now fully populated and ready for Render/Vercel.")

if __name__ == "__main__":
    if "<db_password>" in ATLAS_URI:
        print("ACTION REQUIRED: Open migrate_to_atlas.py in your editor and replace '<db_password>' with your actual database password before running this script.")
    else:
        migrate()
