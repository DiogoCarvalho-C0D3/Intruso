export const compressAvatar = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 256;

                // Calculate crop (Center Logic)
                const size = Math.min(img.width, img.height);
                const x = (img.width - size) / 2;
                const y = (img.height - size) / 2;

                canvas.width = MAX_SIZE;
                canvas.height = MAX_SIZE;

                const ctx = canvas.getContext('2d');
                // Draw cropped image
                ctx.drawImage(img, x, y, size, size, 0, 0, MAX_SIZE, MAX_SIZE);

                // Compress
                const result = canvas.toDataURL('image/jpeg', 0.8);
                resolve(result);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};
