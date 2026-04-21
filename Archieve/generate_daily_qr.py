import qrcode
from datetime import datetime
import os

def generate_qr():
    # 1. Configuration
    base_url = "https://bccl.in/flippedit/"
    city = "ALL" # Change as needed
    
    # 2. Get today's date in YYYYMMDD format
    today = datetime.now().strftime("%Y%m%d")
    
    # 3. Construct the final URL
    # Format: https://bccl.in/flippedit/?city=ALL&date=20260420
    final_url = f"{base_url}?city={city}&date={today}"
    
    print(f"Generating QR for: {final_url}")
    
    # 4. Generate QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(final_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # 5. Save the image
    filename = f"flippit_qr_{today}.png"
    img.save(filename)
    
    print(f"Successfully saved: {os.path.abspath(filename)}")
    print("--------------------------------------------------")
    print("TIP: You can also pass custom city and date via command line if needed.")

if __name__ == "__main__":
    try:
        generate_qr()
    except ImportError:
        print("Error: 'qrcode' library not found.")
        print("Please run: pip install qrcode[pil]")
    except Exception as e:
        print(f"An error occurred: {e}")
