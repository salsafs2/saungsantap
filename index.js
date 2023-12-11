document.addEventListener('DOMContentLoaded', async () => {
	fetch('http://localhost:3001/api/v1/dishes')
		.then((response) => response.json())
		.then((data) => {
			const container = document.querySelector('.dish__grid');
			renderDish(container, data.slice(0, 3));
		})
		.catch((err) => console.error(err));

	const form = document.querySelector('#form');

	form.addEventListener('submit', (event) => {
		event.preventDefault();

		const errors = document.querySelectorAll('.form__error');
		errors?.forEach((error) => error.remove());

		const successes = document.querySelectorAll('.form__success');
		successes?.forEach((success) => success.remove());

		const groups = document.querySelectorAll('.form__group');
		groups?.forEach((group) => group.classList.remove('error'));

		const formData = new FormData(form);
		const data = Object.fromEntries(formData);

		try {
			data.time = new Date(data.time).toISOString();
			data.people = Number.parseInt(data.people, 10);
		} catch (err) {
			console.error(err);
		}

		if (!data.message) data.message = null;

		fetch('http://localhost:3001/api/v1/reservations', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.errors) {
					console.error(data.errors);

					data.errors.forEach((error) => {
						const input = document.querySelector(`[name="${error.path}"]`);
						const parent = input.parentNode;
						const node = document.createElement('span');
						node.classList.add('form__error');
						node.innerText = error.msg;
						parent.classList.add('error');
						parent.appendChild(node);
					});
				} else {
					const container = [...document.querySelectorAll('.form__group')].pop();
					const node = document.createElement('p');
					node.classList.add('form__success');
					node.innerText = 'Reservation success! We will contact you soon.';
					container.appendChild(node);
					form.reset();
				}
			})
			.catch((err) => {
				console.error(JSON.parse(err.message));
			});
	});
});

const html = String.raw;

const renderDish = (container, dishes) => {
	container.innerHTML = '';

	dishes.forEach((dish) => {
		const node = document.createElement('div');
		node.classList.add('dish');

		node.innerHTML = html`
			<img src="${dish.image}" alt="${dish.name}" class="dish__image" />
			<div class="dish__detail">
				<div class="dish__header">
					<h3 class="dish__title">${dish.name}</h3>
					<span class="dish__price">Rp. ${dish.price}</span>
				</div>
				<p class="description">${dish.description}</p>
				<button class="button primary" data-id=${dish.id}>Order Now</button>
			</div>
		`;

		container.appendChild(node);
	});

	const buttons = document.querySelectorAll('.dish button');

	buttons.forEach((button) => {
		button.addEventListener('click', (event) => {
			const id = event.target.dataset.id;

			fetch(`http://localhost:3001/api/v1/carts/add/${id}`)
				.then((response) => response.json())
				.then((data) => {
					alert('Added to cart');
				})
				.catch((err) => console.error(err));
		});
	});
};
