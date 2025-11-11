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
        new Chart(document.getElementById("globalChart"), {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: ["#5C6BC0", "#FBC02D", "#81C784", "#4DB6AC", "#FF8A65"]
                }]
            }
        });
});

// Chart 3 - Top 1 Artist & Songs
fetch('querie3.json')
    .then(res => res.json())
    .then(data => {

        console.log(data)

        const labels = data.map(item => item.Artist);
        const sales = data.map(item => item.TotalSales);

        const ctx = document.getElementById("artistChart").getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Sales',
                    data: sales,
                    backgroundColor: ["#5C6BC0", "#FBC02D", "#81C784"],
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
            backgroundColor: ["#BA68C8", "#FBC02D", "#FF8A65"],
            borderColor: ["#BA68C8", "#FBC02D", "#FF8A65"],
            fill: false,
            tension: 0.3
        }));

        // 🔹 Tegn grafen
        const ctx = document.getElementById('growthChart');
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

