const title = document.querySelector('.title');


let params = (new URL(document.location)).searchParams;

if (params.has("title") === true)
{
    let param_title = params.get('title');
    title.textContent = param_title;

}