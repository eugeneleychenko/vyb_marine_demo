import streamlit as st
import pandas as pd
import os
import re

st.title("Marine Parts Image Identifier")

# Load the catalog data
@st.cache_data
def load_catalog():
    return pd.read_csv("Marine Engine Parts - Catalog.csv")

catalog_df = load_catalog()

# Function to extract SKU from image URL
def extract_sku_from_url(url):
    if pd.isna(url):
        return None
    match = re.search(r'/([^/]+)__\d+', url)
    if match:
        return match.group(1)
    return None

# Function to extract expected filename from URL
def extract_expected_filename(url):
    if pd.isna(url):
        return None
    match = re.search(r'/([^/]+__\d+)\..*?\.jpg', url)
    if match:
        return match.group(1) + ".jpg"
    return None

# Add extracted SKU and expected filename columns
catalog_df['Image_SKU'] = catalog_df['Image URL'].apply(extract_sku_from_url)
catalog_df['Expected_Filename'] = catalog_df['Image URL'].apply(extract_expected_filename)

# Display dataframe for inspection
with st.expander("View Catalog Data"):
    st.write("### Catalog Data Preview")
    st.dataframe(catalog_df)
    
    # Show the extracted columns for better inspection
    st.write("### Extracted SKUs and Expected Filenames")
    extracted_cols = catalog_df[['Name', 'SKU', 'Image URL', 'Image_SKU', 'Expected_Filename']].dropna(subset=['Image URL'])
    st.dataframe(extracted_cols)

uploaded_file = st.file_uploader("Drag and drop an image here", type=["jpg", "jpeg", "png", "gif"])

if uploaded_file is not None:
    # Display the uploaded image
    st.image(uploaded_file, caption='Uploaded Image', width=300)
    
    # Extract SKU from the filename
    filename = uploaded_file.name
    
    st.write(f"Uploaded image filename: {filename}")
    
    # Extract the SKU part from the filename (before the __ pattern)
    sku_match = re.search(r'(.+?)__\d+', filename)
    extracted_sku = sku_match.group(1) if sku_match else os.path.splitext(filename)[0]
    
    st.write(f"Extracted SKU: {extracted_sku}")
    
    # Looking up part information
    st.write("Looking up part information...")
    
    # First try exact filename match
    filename_matches = catalog_df[catalog_df['Expected_Filename'] == filename]
    
    if not filename_matches.empty:
        st.write(f"Found {len(filename_matches)} exact filename matches:")
        st.dataframe(filename_matches[['Name', 'SKU', 'Stock', 'Description']])
    else:
        # Look for matching parts by image SKU
        matches = catalog_df[catalog_df['Image_SKU'] == extracted_sku]
        
        if not matches.empty:
            st.write(f"Found {len(matches)} matching parts by SKU:")
            st.dataframe(matches[['Name', 'SKU', 'Stock', 'Description']])
        else:
            st.write("No matching parts found by image name or SKU.")
            
            # Try matching by SKU directly
            sku_matches = catalog_df[catalog_df['SKU'].str.contains(extracted_sku, case=False, na=False)]
            if not sku_matches.empty:
                st.write(f"Found {len(sku_matches)} parts with similar SKU:")
                st.dataframe(sku_matches[['Name', 'SKU', 'Stock', 'Description']]) 