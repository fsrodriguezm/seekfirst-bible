import csv
import os
import sqlite3
import urllib.request
import zipfile

def download_and_extract_crossrefs():
    """Download and extract cross-references data if needed"""
    
    zip_file = 'cross-references.zip'
    txt_file = 'cross_references.txt'
    url = 'https://a.openbible.info/data/cross-references.zip'
    
    # Check if txt file already exists
    if os.path.exists(txt_file):
        print(f"{txt_file} already exists. Skipping download and extraction.")
        return True
    
    # Check if zip file already exists
    if os.path.exists(zip_file):
        print(f"{zip_file} already exists. Skipping download.")
    else:
        print(f"Downloading {url}...")
        try:
            urllib.request.urlretrieve(url, zip_file)
            print(f"Successfully downloaded {zip_file}")
        except Exception as e:
            print(f"Error downloading file: {str(e)}")
            return False
    
    # Extract zip file
    print(f"Extracting {zip_file}...")
    try:
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall('.')
        print(f"Successfully extracted {zip_file}")
        
        # Verify extraction
        if os.path.exists(txt_file):
            print(f"Confirmed: {txt_file} extracted successfully")
            return True
        else:
            print(f"Error: {txt_file} not found after extraction")
            return False
            
    except Exception as e:
        print(f"Error extracting zip file: {str(e)}")
        return False

def get_book_abbreviations():
    """Return dictionary mapping abbreviations to full book names"""
    return {
        # Old Testament
        'Gen.': 'Genesis',
        'Exod.': 'Exodus',
        'Lev.': 'Leviticus',
        'Num.': 'Numbers',
        'Deut.': 'Deuteronomy',
        'Josh.': 'Joshua',
        'Judg.': 'Judges',
        'Ruth': 'Ruth',
        '1Sam.': '1 Samuel',
        '2Sam.': '2 Samuel',
        '1Kgs.': '1 Kings',
        '2Kgs.': '2 Kings',
        '1Chr.': '1 Chronicles',
        '2Chr.': '2 Chronicles',
        'Ezra': 'Ezra',
        'Neh.': 'Nehemiah',
        'Esth.': 'Esther',
        'Job': 'Job',
        'Ps.': 'Psalms',
        'Prov.': 'Proverbs',
        'Eccl.': 'Ecclesiastes',
        'Song': 'Song of Solomon',
        'Isa.': 'Isaiah',
        'Jer.': 'Jeremiah',
        'Lam.': 'Lamentations',
        'Ezek.': 'Ezekiel',
        'Dan.': 'Daniel',
        'Hos.': 'Hosea',
        'Joel': 'Joel',
        'Amos': 'Amos',
        'Obad.': 'Obadiah',
        'Jonah': 'Jonah',
        'Mic.': 'Micah',
        'Nah.': 'Nahum',
        'Hab.': 'Habakkuk',
        'Zeph.': 'Zephaniah',
        'Hag.': 'Haggai',
        'Zech.': 'Zechariah',
        'Mal.': 'Malachi',
        
        # New Testament
        'Matt.': 'Matthew',
        'Mark': 'Mark',
        'Luke': 'Luke',
        'John': 'John',
        'Acts': 'Acts',
        'Rom.': 'Romans',
        '1Cor.': '1 Corinthians',
        '2Cor.': '2 Corinthians',
        'Gal.': 'Galatians',
        'Eph.': 'Ephesians',
        'Phil.': 'Philippians',
        'Col.': 'Colossians',
        '1Thess.': '1 Thessalonians',
        '2Thess.': '2 Thessalonians',
        '1Tim.': '1 Timothy',
        '2Tim.': '2 Timothy',
        'Titus': 'Titus',
        'Philem.': 'Philemon',
        'Phlm.': 'Philemon',
        'Heb.': 'Hebrews',
        'Jas.': 'James',
        '1Pet.': '1 Peter',
        '2Pet.': '2 Peter',
        '1John': '1 John',
        '2John': '2 John',
        '3John': '3 John',
        'Jude': 'Jude',
        'Rev.': 'Revelation'
    }

def get_old_testament_books():
    """Return set of Old Testament book names"""
    return {
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
        'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', 
        '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
        'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
        'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
        'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
        'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
        'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
    }

def get_new_testament_books():
    """Return set of New Testament book names"""
    return {
        'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
        '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
        'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
        '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
        'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
        'Jude', 'Revelation'
    }

def get_book_testament(book_name):
    """Determine which testament a book belongs to"""
    ot_books = get_old_testament_books()
    nt_books = get_new_testament_books()
    
    if book_name in ot_books:
        return 'OT'
    elif book_name in nt_books:
        return 'NT'
    else:
        return None

def extract_book_name_from_verse(verse_ref):
    """Extract book name from a verse reference like 'Genesis 1:1'"""
    # Handle ranges by taking the first part
    if '-' in verse_ref:
        verse_ref = verse_ref.split('-')[0].strip()
    
    # Find the first space followed by a number (chapter)
    import re
    match = re.match(r'^(.+?)\s+\d+', verse_ref.strip())
    if match:
        return match.group(1).strip()
    
    # Fallback: return everything before the last space
    parts = verse_ref.strip().split()
    if len(parts) > 1:
        return ' '.join(parts[:-1])
    
    return verse_ref.strip()

def expand_verse_reference(verse_ref):
    """Convert abbreviated verse reference to full book name"""
    book_map = get_book_abbreviations()
    
    # Handle verse ranges (e.g., "Romans 2.12-Rom.2.16")
    if '-' in verse_ref:
        parts = verse_ref.split('-')
        expanded_parts = []
        
        for part in parts:
            part = part.strip()
            expanded_parts.append(expand_single_reference(part, book_map))
        
        return '-'.join(expanded_parts)
    
    # Handle single verse reference
    return expand_single_reference(verse_ref, book_map)

def expand_single_reference(verse_ref, book_map):
    """Helper function to expand a single verse reference"""
    verse_ref = verse_ref.strip()
    
    # Try exact matches first (with dots)
    for abbrev, full_name in book_map.items():
        if verse_ref.startswith(abbrev):
            remainder = verse_ref[len(abbrev):].lstrip(' .')
            return full_name + ' ' + remainder
    
    # Try matches with space before dot (e.g., "Job .38.4")
    for abbrev, full_name in book_map.items():
        book_name = abbrev.rstrip('.')  # Remove trailing dot from abbreviation
        if verse_ref.startswith(book_name + ' .'):
            # Found pattern like "Job .38.4"
            remainder = verse_ref[len(book_name + ' .'):].lstrip()
            return full_name + ' ' + remainder
        elif verse_ref.startswith(book_name + '.'):
            # Found pattern like "Job.38.4"
            remainder = verse_ref[len(book_name + '.'):].lstrip()
            return full_name + ' ' + remainder
        elif verse_ref.startswith(book_name + ' ') and book_name == full_name:
            # Found non-abbreviated book with space (e.g., "Job 38.4")
            remainder = verse_ref[len(book_name + ' '):].lstrip()
            return full_name + ' ' + remainder
    
    # If no match found, return original
    return verse_ref

def convert_crossrefs_to_csv():
    """Convert cross_references.txt to CSV format"""

    input_file = 'cross_references.txt'
    output_file = 'cross_references.csv'

    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found in current directory")
        return
    
    # Check if output file already exists
    if os.path.exists(output_file):
        print(f"Output file {output_file} already exists. Skipping conversion.")
        return True
    
    try:
        with open(input_file, 'r', encoding='utf-8') as infile, \
             open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            
            # Create CSV writer
            csv_writer = csv.writer(outfile)
            
            # Process file line by line to handle large files efficiently
            for line_num, line in enumerate(infile, 1):
                # Strip whitespace and split by tabs
                line = line.strip()
                if not line:  # Skip empty lines
                    continue
                
                # Split by tabs
                columns = line.split('\t')
                
                # Write to CSV
                csv_writer.writerow(columns)
                
                # Print progress for large files (every 10000 lines)
                if line_num % 10000 == 0:
                    print(f"Processed {line_num} lines...")
            
        print(f"Successfully converted {input_file} to {output_file}")
        print(f"Total lines processed: {line_num}")
        return True
        
    except Exception as e:
        print(f"Error during conversion: {str(e)}")
        return False

def create_databases():
    """Create SQLite databases for Old Testament and New Testament cross references"""
    
    db_files = ['crossrefs_ot.db', 'crossrefs_nt.db']
    
    for db_file in db_files:
        try:
            # Connect to database (creates file if it doesn't exist)
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            
            # Create table (drop if exists to ensure clean slate for monthly updates)
            cursor.execute('''
                DROP TABLE IF EXISTS cross_references
            ''')
            
            cursor.execute('''
                CREATE TABLE cross_references (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    from_verse TEXT NOT NULL,
                    to_verse TEXT NOT NULL,
                    votes INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create indexes for better query performance
            cursor.execute('''
                CREATE INDEX idx_from_verse ON cross_references(from_verse)
            ''')
            
            cursor.execute('''
                CREATE INDEX idx_to_verse ON cross_references(to_verse)
            ''')
            
            conn.commit()
            conn.close()
            
            print(f"Successfully created database: {db_file}")
            
        except Exception as e:
            print(f"Error creating database {db_file}: {str(e)}")
            return False
    
    return True

def convert_dots_to_colons(verse_ref):
    """Convert dots to colons in verse references (e.g., Genesis 1.1 -> Genesis 1:1)"""
    # Replace the first dot after the book name with a colon
    # This handles cases like "Genesis 1.1" -> "Genesis 1:1"
    # but leaves ranges like "Genesis 1:1-Genesis 1:3" intact
    
    # Find the first space (after book name)
    space_index = verse_ref.find(' ')
    if space_index == -1:
        return verse_ref
    
    # Get book name and verse part
    book_name = verse_ref[:space_index]
    verse_part = verse_ref[space_index + 1:]
    
    # Replace first dot with colon in the verse part
    if '.' in verse_part:
        verse_part = verse_part.replace('.', ':', 1)
    
    return book_name + ' ' + verse_part

# Update the ingest_csv_to_database function
def ingest_csv_to_databases():
    """Ingest CSV data into separate OT and NT SQLite databases"""
    
    csv_file = 'cross_references.csv'
    ot_db_file = 'crossrefs_ot.db'
    nt_db_file = 'crossrefs_nt.db'
    
    # Check if files exist
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found")
        return False
        
    if not os.path.exists(ot_db_file):
        print(f"Error: {ot_db_file} not found. Please create databases first.")
        return False
        
    if not os.path.exists(nt_db_file):
        print(f"Error: {nt_db_file} not found. Please create databases first.")
        return False
    
    try:
        # Open connections to both databases
        ot_conn = sqlite3.connect(ot_db_file)
        nt_conn = sqlite3.connect(nt_db_file)
        ot_cursor = ot_conn.cursor()
        nt_cursor = nt_conn.cursor()
        
        with open(csv_file, 'r', encoding='utf-8') as file:
            csv_reader = csv.reader(file)
            
            # Skip header row if it exists
            first_row = next(csv_reader)
            if 'From Verse' in first_row[0]:
                print("Skipping header row")
            else:
                # If first row is data, process it
                if len(first_row) >= 3:
                    from_verse = expand_verse_reference(first_row[0])
                    to_verse = expand_verse_reference(first_row[1])
                    # Convert dots to colons
                    from_verse = convert_dots_to_colons(from_verse)
                    to_verse = convert_dots_to_colons(to_verse)
                    
                    # Determine which database to use based on the from_verse
                    from_book = extract_book_name_from_verse(from_verse)
                    testament = get_book_testament(from_book)
                    
                    if testament == 'OT':
                        ot_cursor.execute('''
                            INSERT INTO cross_references (from_verse, to_verse, votes)
                            VALUES (?, ?, ?)
                        ''', (from_verse, to_verse, int(first_row[2]) if first_row[2].isdigit() else 0))
                    elif testament == 'NT':
                        nt_cursor.execute('''
                            INSERT INTO cross_references (from_verse, to_verse, votes)
                            VALUES (?, ?, ?)
                        ''', (from_verse, to_verse, int(first_row[2]) if first_row[2].isdigit() else 0))
            
            # Process remaining rows
            batch_size = 1000
            ot_batch = []
            nt_batch = []
            total_ot_rows = 0
            total_nt_rows = 0
            total_skipped = 0
            
            for row in csv_reader:
                if len(row) >= 3:  # Ensure row has required columns
                    # Convert abbreviations to full book names
                    from_verse = expand_verse_reference(row[0])
                    to_verse = expand_verse_reference(row[1])
                    # Convert dots to colons
                    from_verse = convert_dots_to_colons(from_verse)
                    to_verse = convert_dots_to_colons(to_verse)
                    votes = int(row[2]) if row[2].isdigit() else 0
                    
                    # Determine which database to use based on the from_verse
                    from_book = extract_book_name_from_verse(from_verse)
                    testament = get_book_testament(from_book)
                    
                    if testament == 'OT':
                        ot_batch.append((from_verse, to_verse, votes))
                        
                        if len(ot_batch) >= batch_size:
                            ot_cursor.executemany('''
                                INSERT INTO cross_references (from_verse, to_verse, votes)
                                VALUES (?, ?, ?)
                            ''', ot_batch)
                            total_ot_rows += len(ot_batch)
                            ot_batch = []
                            
                    elif testament == 'NT':
                        nt_batch.append((from_verse, to_verse, votes))
                        
                        if len(nt_batch) >= batch_size:
                            nt_cursor.executemany('''
                                INSERT INTO cross_references (from_verse, to_verse, votes)
                                VALUES (?, ?, ?)
                            ''', nt_batch)
                            total_nt_rows += len(nt_batch)
                            nt_batch = []
                    else:
                        total_skipped += 1
                        if total_skipped <= 10:  # Show first 10 skipped entries for debugging
                            print(f"Skipped unknown book: {from_book} in verse {from_verse}")
                    
                    # Print progress
                    total_processed = total_ot_rows + total_nt_rows + len(ot_batch) + len(nt_batch)
                    if total_processed % 10000 == 0:
                        print(f"Processed {total_processed} records (OT: {total_ot_rows + len(ot_batch)}, NT: {total_nt_rows + len(nt_batch)}, Skipped: {total_skipped})...")
            
            # Insert remaining batches
            if ot_batch:
                ot_cursor.executemany('''
                    INSERT INTO cross_references (from_verse, to_verse, votes)
                    VALUES (?, ?, ?)
                ''', ot_batch)
                total_ot_rows += len(ot_batch)
                
            if nt_batch:
                nt_cursor.executemany('''
                    INSERT INTO cross_references (from_verse, to_verse, votes)
                    VALUES (?, ?, ?)
                ''', nt_batch)
                total_nt_rows += len(nt_batch)
        
        # Commit and close connections
        ot_conn.commit()
        nt_conn.commit()
        ot_conn.close()
        nt_conn.close()
        
        print(f"Successfully ingested:")
        print(f"  Old Testament: {total_ot_rows} records")
        print(f"  New Testament: {total_nt_rows} records")
        print(f"  Skipped: {total_skipped} records")
        return True
        
    except Exception as e:
        print(f"Error ingesting data: {str(e)}")
        return False

def main():
    """Main function to orchestrate the entire process"""
    
    print("Starting cross-reference data processing...")
    print("=" * 50)
    
    # Step 0: Download and extract data if needed
    print("Step 0: Checking for data files...")
    if not download_and_extract_crossrefs():
        print("Download/extraction failed. Stopping process.")
        return
    
    # Step 1: Convert to CSV
    print("\nStep 1: Converting to CSV...")
    if not convert_crossrefs_to_csv():
        print("CSV conversion failed. Stopping process.")
        return
    
    # Step 2: Create databases
    print("\nStep 2: Creating SQLite databases...")
    if not create_databases():
        print("Database creation failed. Stopping process.")
        return
    
    # Step 3: Ingest CSV data
    print("\nStep 3: Ingesting CSV data into databases...")
    if not ingest_csv_to_databases():
        print("Data ingestion failed. Stopping process.")
        return
    
    print("\n" + "=" * 50)
    print("Cross-reference data processing completed successfully!")
    
    # Display summary
    try:
        for db_name, db_file in [('Old Testament', 'crossrefs_ot.db'), ('New Testament', 'crossrefs_nt.db')]:
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM cross_references')
            count = cursor.fetchone()[0]
            conn.close()
            print(f"Total records in {db_name} database: {count:,}")
    except Exception as e:
        print(f"Could not get record count: {str(e)}")

if __name__ == "__main__":
    main()