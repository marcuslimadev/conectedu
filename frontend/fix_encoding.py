import os

file_path = "frontend/spa-tailwind.js"
new_content_path = "frontend/new_home_landing_clean.txt"

# Read file as bytes
with open(file_path, 'rb') as f:
    content_bytes = f.read()

# Read new block as UTF-8
with open(new_content_path, 'r', encoding='utf-8') as f:
    new_block_str = f.read()

# Convert file content to string, handling simple UTF-8
content_str = content_bytes.decode('utf-8', errors='replace')

start_marker = "// PÃ¡gina inicial com login embutido" 
start_marker_clean = "// Página inicial com login embutido"

start_index = content_str.find(start_marker)

if start_index == -1:
    start_index = content_str.find(start_marker_clean)
    if start_index == -1:
        print("Start marker not found")
        exit(1)
    
# We found where to start replacing.
# We also need to find where to END replacing.
end_marker = "const Login = {"
end_index = content_str.find(end_marker, start_index)

if end_index == -1:
    print("End marker not found")
    exit(1)

# Now we perform the replacement in the STRING representation
prefix = content_str[:start_index]
suffix = content_str[end_index:]

# Insert the clean marker
clean_marker = "// Página inicial com login embutido\n"

# Check if new_block_str already has the marker
if "const HomeLanding = {" in new_block_str:
    # new_block_str starts with "const HomeLanding = {" usually
    final_content = prefix + clean_marker + new_block_str + "\n\n// Página de Login\n" + suffix[len("const Login = {"):]
    # Wait, suffix starts with "const Login = {". We should NOT consume it if we appended it manually.
    # But wait, looking at my PowerShell logic:
    # $suffix = $content.Substring($endIndex)  -> includes "const Login = {"
    # $newContent = $prefix + $newBlock + $separator + $suffix
    
    # In my txt file, I have "const HomeLanding = { ... };"
    # I want to put:
    # PREFIX
    # // Página inicial...
    # NEW_BLOCK
    # 
    # // Página de Login
    # SUFFIX (starting with const Login = {)
    
    final_content = prefix + clean_marker + new_block_str + "\n\n// Página de Login\n" + suffix

else:
    print("New block format unexpected")
    exit(1)

# Write back as proper UTF-8
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Success")
