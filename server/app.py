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
        client = anthropic.Anthropic(api_key= "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")
        
        # Creating a detailed prompt with product information
        prompt = f"""
        I need you to act as a knowledgeable marine supply shop salesperson.
        
        Here's information about a marine part:
        - Name: {part_info['Name']}
        - SKU: {part_info['SKU']}
        - Stock: {part_info['Stock']}
        - Price: {part_info.get('Price', 'Contact for pricing')}
        - Description: {part_info['Description']}
        
        You're a marine supply shop salesperson. The person showed you this part. They quickly want to know if we have it and how much it is. And then ask if you can help any more.
        """
        
        message = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=500,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract just the text content from the response
        return message.content[0].text
    except Exception as e:
        st.error(f"Error generating description: {str(e)}")
        return "Could not generate product description at this time."

# Function to convert text to speech using ElevenLabs API
def text_to_speech(text):
    try:
        import requests
        import io
        
        # Get API key from environment variables
        elevenlabs_api_key = "128498ff7866a6e9bce6e996585a4045"

        
        if not elevenlabs_api_key:
            st.warning("ElevenLabs API key not found in environment variables.")
            return None
            
        # Default voice ID - you can change this to any voice you prefer
        voice_id = "21m00Tcm4TlvDq8ikWAM"  # Default ElevenLabs voice
        
        # API endpoint for streaming
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"
        
        # Headers
        headers = {
            "xi-api-key": elevenlabs_api_key,
            "Content-Type": "application/json"
        }
        
        # Request body
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "output_format": "mp3_44100_128"
        }
        
        # Make the API request with stream=True
        response = requests.post(url, json=data, headers=headers, stream=True)
        
        if response.status_code == 200:
            # Collect all chunks into a BytesIO object
            audio_data = io.BytesIO()
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    audio_data.write(chunk)
            
            # Reset the pointer to the beginning of the BytesIO object
            audio_data.seek(0)
            return audio_data.getvalue()
        else:
            st.error(f"Error from ElevenLabs API: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        st.error(f"Error converting text to speech: {str(e)}")
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
        
        # Generate sales description for the first match
        with st.spinner("Generating product description..."):
            sales_description = generate_sales_description(filename_matches.iloc[0])
            st.write("### Product Description")
            st.write(sales_description)
            
            # Generate audio for the sales description
            with st.spinner("Converting description to audio..."):
                audio_data = text_to_speech(sales_description)
                if audio_data:
                    st.audio(audio_data, format="audio/mp3")
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
                
                # Generate audio for the sales description
                with st.spinner("Converting description to audio..."):
                    audio_data = text_to_speech(sales_description)
                    if audio_data:
                        st.audio(audio_data, format="audio/mp3")
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
                    
                    # Generate audio for the sales description
                    with st.spinner("Converting description to audio..."):
                        audio_data = text_to_speech(sales_description)
                        if audio_data:
                            st.audio(audio_data, format="audio/mp3") 