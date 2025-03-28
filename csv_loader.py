import streamlit as st
import pandas as pd

st.title("CSV File Loader")

uploaded_file = st.file_uploader("Drag and drop a CSV file", type=["csv"], key="csv_uploader")

if uploaded_file is not None:
    # Read the CSV file into a pandas DataFrame
    df = pd.read_csv(uploaded_file)
    
    # Display the DataFrame
    st.write("Data Preview:")
    st.dataframe(df)
    
    # Display basic information about the DataFrame
    st.write("Data Information:")
    st.write(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    
    # Display column names
    st.write("Columns:")
    st.write(df.columns.tolist())
