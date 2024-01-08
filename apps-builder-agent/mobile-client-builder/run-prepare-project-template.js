import { prepareProjectTemplate } from "./project-template.js"

prepareProjectTemplate(process.argv[2])
.then(() => {
    console.log('Program completed!')
    process.exit(0)
})
.catch(err => {
    console.error(err)
    console.error('Program errored!')
    process.exit(1)
})
