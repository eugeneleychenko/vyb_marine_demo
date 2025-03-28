import streamlit as st
import pandas as pd
import os
import re
import anthropic
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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

# Function to generate sales description using Claude
def generate_sales_description(part_info):
    try:
        # Simple initialization with just the API key
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            return "API key not found. Please check your .env file."
            
        client = anthropic.Anthropic(api_key=api_key)
        
        # Creating a detailed prompt with product information
        prompt = f"""
        I need you to act as a knowledgeable marine supply shop salesperson.
        
        Here's information about a marine part:
        - Name: {part_info['Name']}
        - SKU: {part_info['SKU']}
        - Stock: {part_info['Stock']}
        - Price: {part_info.get('Price', 'Contact for pricing')}
        - Description: {part_info['Description']}
        
        Write a friendly, enthusiastic paragraph selling this product. Mention its benefits, 
        availability, and suggest when a customer might need it. Be personable and helpful.
        """
        
        message = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return message.content
    except Exception as e:
        st.error(f"Error generating description: {str(e)}")
        return "Could not generate product description at this time."

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
        
        # Generate sales description for the first match
        with st.spinner("Generating product description..."):
            sales_description = generate_sales_description(filename_matches.iloc[0])
            st.write("### Product Description")
            st.write(sales_description)
    else:
        # Look for matching parts by image SKU
        matches = catalog_df[catalog_df['Image_SKU'] == extracted_sku]
        
        if not matches.empty:
            st.write(f"Found {len(matches)} matching parts by SKU:")
            st.dataframe(matches[['Name', 'SKU', 'Stock', 'Description']])
            
            # Generate sales description for the first match
            with st.spinner("Generating product description..."):
                sales_description = generate_sales_description(matches.iloc[0])
                st.write("### Product Description")
                st.write(sales_description)
        else:
            st.write("No matching parts found by image name or SKU.")
            
            # Try matching by SKU directly
            sku_matches = catalog_df[catalog_df['SKU'].str.contains(extracted_sku, case=False, na=False)]
            if not sku_matches.empty:
                st.write(f"Found {len(sku_matches)} parts with similar SKU:")
                st.dataframe(sku_matches[['Name', 'SKU', 'Stock', 'Description']])
                
                # Generate sales description for the first match
                with st.spinner("Generating product description..."):
                    sales_description = generate_sales_description(sku_matches.iloc[0])
                    st.write("### Product Description")
                    st.write(sales_description) 