export default function formValid() {
  const form = document.querySelector('.form');

  function valid() {}

  return {
    submitInit() {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        valid();
      });
    },
  };
}
