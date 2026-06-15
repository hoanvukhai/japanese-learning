import os, glob, re

files = glob.glob('src/pages/**/components/*.tsx', recursive=True)
count = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    pattern = r'\{q\.explanation && \([\s\S]*?Giải thích chi tiết:[\s\S]*?\{q\.explanation\}[\s\S]*?\)\}'
    
    new_content = re.sub(pattern, '', content)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        count += 1
        print(f'Removed explanation from {f}')

print(f'Done modifying {count} files')
