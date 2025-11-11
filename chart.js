

// Chart 4 - Genre Growth Popularity
fetch('querie4.json')
    .then(response => {
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        return response.json();
    })
    .then(data => {
        console.log('Data loaded:', data);
// delete me
        // 🔹 Labels = årstal (fra første objekt)
        const labels = Object.keys(data[0]).filter(key => /^\d{4}$/.test(key));

        // 🔹 Datasets = ét sæt pr. genre
        const datasets = data.map(item => ({
            label: item.Genre,
            data: labels.map(year => item[year]),
            borderColor: randomColor(),
            fill: false,
            tension: 0.3
        }));

        // 🔹 Tegn grafen
        const ctx = document.getElementById('chart-growth');
        new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Udvikling i solgte tracks pr. genre (2009–2013)'
                    },
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Solgte tracks' } }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching JSON:', error));


// 🔸 Lille hjælpefunktion til tilfældige farver
function randomColor() {
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F1C40F', '#E67E22'];
    return colors[Math.floor(Math.random() * colors.length)];
}
