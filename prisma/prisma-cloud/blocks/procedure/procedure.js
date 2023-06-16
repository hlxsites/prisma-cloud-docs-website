/**
 * @param {HTMLDivElement} block
 */
export default function decorate(block) {
  const lists = block.querySelectorAll(':scope > div > div > ol');
  lists.forEach((list) => {
    list.classList.add('steps');

    const steps = list.querySelectorAll(':scope > li');
    steps.forEach((step) => {
      step.classList.add('step');

      const sublists = step.querySelectorAll(':scope > ol');
      sublists.forEach((sublist) => {
        sublist.classList.add('substeps');

        const substeps = sublist.querySelectorAll(':scope > li');
        substeps.forEach((substep) => {
          substep.classList.add('substep');
        });
      });
    });
  });
}
