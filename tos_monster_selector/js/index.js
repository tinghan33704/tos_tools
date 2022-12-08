const tool_id = 'monster_selector'

let chosenMonster = new Set()
let playerInputMonster = new Set()
let filter_set = new Set()
let theme = 'normal'

$(document).ready(function(){
	init()
	
	chosenMonster.clear()
	$("#craft_id_string").on("click", craftString)
	$("#reset_chosen").on("click", resetChosen)
	$(".result-row").css({'display': 'none'})
	$(".preview-hr").css({'display': 'none'})
	$(".preview-row").css({'display': 'none'})
    
    $('#toTop-btn').click(() => { 
        $('html,body').animate({
            scrollTop: 0
        }, 300)
    });
	
	createFilterButtonRow("tag", tag_string)
	createExtraTagFilterButtonRow("extra-tag", extraFilter_data)
	createFilterButtonRow("version-tag", version_string)
	
	$(".result-row").on('click', copyToClipboard)
});

$(window).resize(function(){
    $('.side_navigation').css({top: (parseInt($('#top-bar').css('height'))-20)+'px'})
});

function createExtraTagFilterButtonRow(name, data) {
	$(`.${name}-row`).html(() =>
	{
		let str = $(`.${name}-row`).html();
		$.each(data, (group_index, tagGroup) => {
			$.each(tagGroup, (index, tag) => {
				str += 
				`<div class='col-6 col-md-4 col-lg-2 btn-shell' title='${tag.name}'>
					<input type='checkbox' class='filter' id='${name}-${group_index}-${index}'>
					<label class='p-1 w-100 text-center ${name}-btn' for='${name}-${group_index}-${index}'>${tag.name}</label>
				</div>`
			})
			str += `<div class="col-12 my-2"></div>`
		})
		
		return str
	})
}


function resetChosen() {
	clearFilterButtonRow('tag')()
	clearFilterButtonRow('extra-tag')()
	clearFilterButtonRow('version-tag')()
	playerInputMonster.clear()
	chosenMonster.clear()
}

function filterMonster() {
	let result_set = new Set();
	
    let tag_set = new Set();
    let extra_tag_set = new Set();
    let version_tag_set = new Set();
	
    let isTagSelected = false;
    let isExtraTagSelected = false;
    let isVersionTagSelected = false;
	
	[tag_set, isTagSelected] = getSelectedButton('tag');
	[extra_tag_set, isExtraTagSelected] = getSelectedButton('extra-tag');
	[version_tag_set, isVersionTagSelected] = getSelectedButton('version-tag');

	$.each(monster_data, (index, monster) => {
		if(monster.star <= 0) return
		
		let hasTag = false
		
		if(isTagSelected) {
			
			$.each(monster?.monsterTag, (tag_index, tag) => {
				if(tag_set.has(tag)) {
					hasTag = true
					return
				}
			})
			
			if((tag_set.has('自家') && !monster.crossOver) || (tag_set.has('合作') && monster.crossOver)) hasTag = true
			
			if(hasTag) {
				result_set.add(monster.id)
				return
			}
		}
		
		if(isExtraTagSelected) {
			const selectedData = extraFilter_data.reduce(function(acc, cur){
				 return acc.concat(cur);
			}, []).filter(tag => extra_tag_set.has(tag.name))
			const idGroup = selectedData.map(tag => tag.otherMonsters).reduce(function(acc, cur){
				 return acc.concat(cur);
			}, [])
			const tagGroup = selectedData.map(tag => tag.tags).reduce(function(acc, cur){
				 return acc.concat(cur);
			}, [])
			
			if(idGroup.includes(monster.id)) {
				result_set.add(monster.id)
				return
			}
			
			let hasTag = false
			
			$.each(monster?.monsterTag, (tag_index, tag) => {
				if(tagGroup.includes(tag)) {
					hasTag = true
					return
				}
			})
			
			if(hasTag) {
				result_set.add(monster.id)
				return
			}
		}
		
		if(isVersionTagSelected) {
			if(version_tag_set.has(monster.version)) {
				result_set.add(monster.id)
			}
		}
	})
	
	return result_set
}

function renderPreview() {
	const combinedSet = new Set([...playerInputMonster, ...chosenMonster])
	$('.preview-panel').html(() =>
	{
		let str = '';
		str += '<div class="row">'
		$.each([...combinedSet], (index, monsterId) => {
			str += renderMonsterImage(monsterId)
		})
		str += '</div>'
		return str
	})
	
	$(".preview-row").css({'display': 'block'})
	$(".preview-hr").css({'display': 'block'})
}

function renderMonsterImage(monsterId, tooltip_content) {
    const monster_obj = monster_data.find((element) => {
        return element.id == monsterId;
    });
	
	if(!monster_obj) return ''
	
    const monster_attr = monster_obj?.attribute
	
    return `
        <div class='col-3 col-md-2 col-lg-1 result'>
            <img class='monster_img' src='../tos_tool_data/img/monster/${monsterId}.png' onerror='this.src="../tos_tool_data/img/monster/noname_${attr_zh_to_en[monster_attr]}.png"' style='cursor: default;'></img>
            <div class='monsterId'>
                <a href='https://tos.fandom.com/zh/wiki/${monsterId}' target='_blank'>${paddingZeros(monsterId, 3)}</a>
            </div>
        </div>
    `;
}

function craftString() {
	chosenMonster = filterMonster()
	
	const combinedSet = new Set([...playerInputMonster, ...chosenMonster])
	if([...combinedSet].length === 0) {
		errorAlert(11)
		return 
	}
	
	renderPreview()
	
	$(".result-panel").removeClass('result-panel-copied')
	$("#note-row").html('<i class="fa fa-lightbulb-o"></i>&nbsp;點擊區塊可直接複製完整字串')
	$("#result-panel").html([...combinedSet].join(' '))
	$(".result-row").css({'display': 'block'})
    jumpTo("result_title")
}

function copyToClipboard(e) {
	$("#result-panel").select()
	e.preventDefault()

	var copyText = $("#result-panel").html()

	var textarea = document.createElement("textarea")
	textarea.textContent = copyText
	textarea.style.position = "fixed"
	document.body.appendChild(textarea)
	textarea.select()
	document.execCommand("copy")
	document.body.removeChild(textarea)
	
	$(".result-panel").addClass('result-panel-copied')
	$("#note-row").html('<i class="fa fa-check"></i>&nbsp;複製成功')
}

function openDataInputPanel() {
    $('#inputPanel').modal('show')
    renderDataInputPanel()
}

function renderDataInputPanel() {
    let render_str = "";
	render_str += `
	<div class='row data-input-row'>
		<div class='col-12 col-md-12 col-lg-12 data-input-tab'>
			<div class='col-12 col-md-12 col-lg-12 option-text'>匯入編號</div>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<textarea type='text' class='form-control data-textarea' id='data-textarea' placeholder='輸入編號字串' onkeypress='return (event.charCode !=8 && event.charCode == 0 || event.charCode == 32 || (event.charCode >= 48 && event.charCode <= 57))'></textarea>
			</div>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<div>
					<button class='btn btn-success btn-block uid-btn' id='update-confirm-uid' onclick='getInputData()'>
						匯入
					</button>
				</div>
			</div>
		</div>
	</div>
	`

    $("#inputPanel .modal-body").html(render_str)
}

function isValidInputString(str) {
	// only accept number and space
	return /^(?=.*\d\s)[\d\s]+$/.test(str)
}

function getInputData() {
	const dataString = $('#data-textarea').val()
	
	if(!isValidInputString(dataString)) {
		errorAlert(9)
		return
	}
	
	resetChosen()
	playerInputMonster = new Set(dataString.split(/\s+/).filter(str => str.length > 0).map(str => parseInt(str)))
	$('#inputPanel').modal('hide')
	craftString()
}