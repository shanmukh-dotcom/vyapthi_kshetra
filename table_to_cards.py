import os
from bs4 import BeautifulSoup
import glob

def process_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    modified = False
    for table in soup.find_all('table', class_='data-table'):
        thead = table.find('thead')
        if not thead: continue
        headers = []
        for th in thead.find_all('th'):
            # clean text
            headers.append(th.get_text(strip=True))
        
        tbody = table.find('tbody')
        if not tbody: continue
        
        for tr in tbody.find_all('tr'):
            tds = tr.find_all('td')
            for i, td in enumerate(tds):
                if i < len(headers):
                    if not td.has_attr('data-label'):
                        td['data-label'] = headers[i]
                        modified = True
                        
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        return True
    return False

for file in glob.glob('farmer-*.html'):
    if process_html_file(file):
        print(f"Added data-labels to tables in {file}")

css = """
@media (max-width: 768px) {
  /* Convert tables to cards on mobile */
  .data-table, .data-table tbody, .data-table tr, .data-table td {
    display: block;
    width: 100%;
  }
  
  .data-table thead {
    display: none;
  }
  
  .data-table tr {
    margin-bottom: 16px;
    border: 1px solid #E4EBE6;
    border-radius: 12px;
    padding: 12px;
    background: #FFFFFF;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }
  
  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
    border-bottom: 1px solid #F4F7F5;
    padding: 8px 4px;
    font-size: 13px;
  }
  
  .data-table td:last-child {
    border-bottom: none;
  }
  
  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-text-muted);
    text-align: left;
    margin-right: 12px;
  }
}
"""

with open("src/style.css", "a", encoding='utf-8') as f:
    f.write(css)
    
print("Added mobile table cards CSS.")
