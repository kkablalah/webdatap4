// Chart 1 - Top Genre by Country – World Map


//Chart 2 - Hvilke genre dominere globalt?
// Hent data fra JSON-filen
fetch("globalChart.json")
    .then(response => response.json()) // lav teksten om til data
    .then(data => {
        data.sort((a, b) => b.PercentShare - a.PercentShare);

        // Tag de 4 største
        const top4 = data.slice(0, 4);

        // Læg resten sammen som "Other"
        const other = data.slice(4).reduce((sum, item) => sum + item.PercentShare, 0);

        // Lav labels og værdier
        const labels = [...top4.map(item => item.Genre), "Other"];
        const values = [...top4.map(item => item.PercentShare), other];

        // Lav pie chartet
        new Chart(document.getElementById("chart-global"), {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ["red", "orange", "yellow", "green", "blue", "purple"]
                }]
            }
        });
});

// Chart 3 - Top 1 Artist & Songs
fetch('/query3.json')
    .then(res => res.json())
    .then(data => {
        const labels = data.map(item => item.Artist);
        const sales = data.map(item => item.TotalSales);

        const ctx = document.getElementById('chart-artistSongs').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Sales',
                    data: sales,
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderWidth: 1,
                }]
            }
        });
    });

// Chart 4 - Genre Growth Popularity
fetch('querie4.json')
    .then(response => {
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        return response.json();
    })
    .then(data => {
        console.log('Data loaded:', data);

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


// Farver
function randomColor() {
    const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F1C40F', '#E67E22'];
    return colors[Math.floor(Math.random() * colors.length)];
}