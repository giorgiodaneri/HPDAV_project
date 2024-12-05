import pandas as pd

# Define the classifications to keep
target_classifications = {
    "Attempted Information Leak",
    "Potential Corporate Privacy Violation",
    "Potentially Bad Traffic"
}

# Input and output file paths
input_file = "MC2-CSVFirewallandIDSlogs/IDSlog.04062012-replacement.txt"
output_file = "MC2-CSVFirewallandIDSlogs/filtered_IDSlog.txt"

# Read all lines from the file
with open(input_file, 'r') as infile:
    lines = infile.readlines()

# Prepare a list to hold the lines to write
with open(output_file, 'w') as outfile:
    # Iterate through each line in the file
    for i, line in enumerate(lines):
        # Check if the line contains any target classification
        if any(classification in line for classification in target_classifications):
            # Write the previous line (if it exists)
            if i > 0:
                outfile.write(lines[i - 1])
            # Write the current line
            outfile.write(line)
            # Write up to 2 lines after (if they exist)
            if i + 1 < len(lines):
                outfile.write(lines[i + 1])
            if i + 2 < len(lines):
                outfile.write(lines[i + 2])
            # Add a blank line
            outfile.write("\n")