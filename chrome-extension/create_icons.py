from PIL import Image, ImageDraw, ImageFont

def create_icon(size):
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Draw cookie emoji or circle
    circle_size = int(size * 0.7)
    circle_pos = (size - circle_size) // 2
    draw.ellipse([circle_pos, circle_pos, circle_pos + circle_size, circle_pos + circle_size], 
                 fill='#f59e0b', outline='white', width=max(1, size//32))
    
    # Add smaller circles (cookie chips)
    chip_size = max(1, size // 10)
    positions = [(0.3, 0.3), (0.6, 0.35), (0.4, 0.6), (0.65, 0.65)]
    for px, py in positions:
        x = int(size * px)
        y = int(size * py)
        draw.ellipse([x, y, x + chip_size, y + chip_size], fill='#78350f')
    
    return img

# Create icons
for size in [16, 48, 128]:
    icon = create_icon(size)
    icon.save(f'icon{size}.png')
    print(f'Created icon{size}.png')

print('All icons created successfully!')
