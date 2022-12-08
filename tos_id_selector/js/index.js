const tool_id = 'id_selector';

let chosenCraft = new Set()
const craftPureName = new Set()
const craftDataByName = {}
let theme = 'normal';

let thInitPosition = {top: 0, left: 0}

$(window).resize(() => {
    $('.side_navigation').css(
        {
            top: (parseInt($('#top-bar').css('height'))-20)+'px',
			left: thInitPosition.left+'px'
        }
    );
	
	thInitPosition.top = $('#craft-table')[0].offsetTop
	thInitPosition.left = $('#craft-table')[0].offsetLeft
	
	$('.sticky-header').css(
		{
			width: (parseFloat($('#craft-table').width()))+'px',
			top: thInitPosition.top+'px',
			left: thInitPosition.left+1+'px'
		}
	)
	
	$('.monster-th').css(
		{
			width: (parseFloat($('.monster-td').outerWidth()))+'px',
		}
	)
	$('.craft-th').css(
		{
			width: (parseFloat($('.craft-td').outerWidth()))+'px',
		}
	)
});

$(document).ready(function(){
	init()
	
	chosenCraft.clear()
	$("#craft_id_string").on("click", craftString);
	$("#reset_chosen").on("click", resetChosen);
	$(".result-row").css({'display': 'none'})
    
    $('#toTop-btn').click(() => { 
        $('html,body').animate({
            scrollTop: 0
        }, 300);
    });
	
	createData();
    createTable();
	
	$('.sticky-header').css(
		{
			width: (parseFloat($('#craft-table').width()))+'px'
		}
	)
	
	$('.monster-th').css(
		{
			width: (parseFloat($('.monster-td').outerWidth()))+'px',
		}
	)
	$('.craft-th').css(
		{
			width: (parseFloat($('.craft-td').outerWidth()))+'px',
		}
	)
	
	thInitPosition.top = $('#craft-table')[0].offsetTop
	thInitPosition.left = $('#craft-table')[0].offsetLeft
    
    $(window).scroll(() => {
        if ($(this).scrollTop() > 300) $('#toTop-btn').fadeIn(200);
        else $('#toTop-btn').stop().fadeOut(200);
		
		// fixed header
		if ($(this).scrollTop() > $('#top-bar').height() && $(this).scrollTop() < $('#craft-table')[0].offsetHeight) {
			$('.sticky-header').css(
				{
					top: $('#top-bar').height() + 'px',
				}
			)
		}
		else {
			if($('.sticky-header').css('top') !== thInitPosition.top - $(this).scrollTop() +'px') {
				$('.sticky-header').css(
					{
						top: thInitPosition.top - $(this).scrollTop() +'px',
					}
				)
			}
		}
    });
	
	$("#craft-table").on('scroll', function(){
		$('.sticky-header').css(
			{
				left: thInitPosition.left - (parseInt($('#craft-table')[0].scrollLeft)) + 1 +'px'
			}
		)
	});
	
	$(".result-row").on('click', copyToClipboard)
});

$(window).resize(function(){
    $('.side_navigation').css({top: (parseInt($('#top-bar').css('height'))-20)+'px'});
});

function clickCell(field, value, row, $element) {
	const craftType = craft_mode_type_string[parseInt(field.replace('craft-', ''))]
	const craftId = row?.['row-data']?.[craftType] ?? -1
	
	onClickCraft(craftId)
}

function createData() {
	armed_craft_data.forEach(craft => {
		const pureName = getPureName(craft.name)
		if(!craftDataByName[pureName]) {
			craftDataByName[pureName] = {}
		}
		
		if(!craftDataByName[pureName]?.monster) {
			craftDataByName[pureName].monster = craft.monster
		}
		
		if(!craftDataByName[pureName]?.attribute) {
			craftDataByName[pureName].attribute = craft.attribute
		}
		
		if(!craftDataByName[pureName]?.race) {
			craftDataByName[pureName].race = craft.race
		}
		
		if(!craftDataByName[pureName]?.series) {
			craftDataByName[pureName].series = craft.series
		}
		
		if(!craftDataByName[pureName]?.nameTag) {
			craftDataByName[pureName].nameTag = craft.nameTag
		}
		
		craftPureName.add(getPureName(craft.name))
		craftDataByName[getPureName(craft.name)][craft.mode] = craft.id
	})
}

function createTable() {
	const craftTypeImg = [1, 2, 3, 35, 58, 75, 112, 171, 246, 329]
	let tableHtml = `
		<table class="table table-bordered table-responsive" id="craft-table">
			<thead class="thead-dark sticky-header">
				<tr>
					<th class="align-middle monster-th">
						<img \>
					</th>
					${craft_mode_type_string.map((str, index) => `
						<th class="craft-th" onClick='selectWholeColumn("${str}")'>
							<img src='../tos_tool_data/img/craft/${craftTypeImg[index]}.png' \>
							<div class="monsterId">
								${`${str.slice(-2)}`}
							</div>
						</th>
					`).join('')}
				</tr>
			</thead>
			<tbody id="craft-table-body">
				<!-- empty row -->
				<tr>
					<td class="monster-td">
						<img height='80px'/>
					</td>
				</tr>
				<!-- -->
				${
					Object.keys(craftDataByName).map(craft => {
						return `
							<tr>
								<td class="align-middle monster-td" onClick='selectWholeRow("${craft}")'>
									${
										craftDataByName[craft]?.series ? craftDataByName[craft]?.series.map(
											serie => `<img src='../tos_tool_data/img/series/${serie}.png'\>`
										).join('')
										: craftDataByName[craft]?.monster ? craftDataByName[craft]?.monster?.map(monster => {
											return `<img src='../tos_tool_data/img/monster/${monster}.png'\>`
										}).join('')
										: (craftDataByName[craft]?.attribute || craftDataByName[craft]?.race) ? 
											`${craftDataByName[craft]?.attribute && craftDataByName[craft]?.attribute !== '沒有限制' ? `<img src='../tos_tool_data/img/monster/icon_${attr_zh_to_en[craftDataByName[craft]?.attribute]}.png'\>` : ''}${craftDataByName[craft]?.race && craftDataByName[craft]?.race !== '沒有限制' ? `<img src='../tos_tool_data/img/monster/icon_${race_zh_to_en[craftDataByName[craft]?.race]}.png'\>` : ''}`
										: ``
										
									}
								</td>
								${
									craft_mode_type_string.map(type => {
										const craftName = armed_craft_data.find(c => c.id === craftDataByName[craft][type])?.name
										const craftNameTag = armed_craft_data.find(c => c.id === craftDataByName[craft][type])?.nameTag
										const errorTypeId = craftTypeImg[craft_mode_type_string.findIndex(t => t === type)]
										return craftDataByName?.[craft]?.[type] ? `
											<td class="align-middle craft-td" id="craft-${craftDataByName[craft][type]}" onClick='onClickCraft(${craftDataByName[craft][type]})'>
												${`<img title='${craftName}' alt='${craftDataByName[craft][type]}' src='../tos_tool_data/img/craft/${craftDataByName[craft][type]}.png' onerror='this.src="../tos_tool_data/img/craft/${errorTypeId}.png"' onClick='onClickCraft(${craftDataByName[craft][type]})'\>`}
												${
													craftNameTag?.length ? `
														<div class="monsterId craftNameTag">
															${craftNameTag}
														</div>
													` : ''
												
												}												
												<div class="monsterId">
													${paddingZeros(craftDataByName[craft][type], 3)}
												</div>
											</td>
										` : '<td class="craft-td"><img \></td>'
									}).join('')
								}
							</tr>
						`
					}).join('')
					
				}
			</tbody>
		</table>
	`
	$('.armed-craft-row').html(tableHtml)
	
}

function getPureName(name) {
	return name.replace(/\s|‧/g, '').replace(/【(.*?)】/g, '').replace(/龍紋|龍印|龍咒|龍符|龍玉|龍刃|龍璃|龍結|龍丸|龍弦/g, '').replace(/連鎖|轉動|破碎|映照|疾速|裂空|落影|擴散|鏡像|節奏/g, '')
}

function onClickCraft(id) {
	event.stopPropagation()
	selectCraft(id)
}

function selectCraft(id) {
	if(!$('#craft-'+id).length) return
	
	const craftTd = $('#craft-'+id).get(0)
	
	if(chosenCraft.has(id)) {
		chosenCraft.delete(id)
		$('#craft-'+id).removeClass('craft-td-selected')
	}
	else {
		chosenCraft.add(id)
		$('#craft-'+id).addClass('craft-td-selected')
	}
}

function selectWholeRow(craftName) {
	Object.keys(craftDataByName[craftName]).filter(c => c!=='monster').map(c => craftDataByName[craftName][c]).forEach(craft => onClickCraft(craft))
}

function selectWholeColumn(type) {
	Object.keys(craftDataByName).filter(name => craftDataByName[name][type]).map(name => craftDataByName[name][type]).forEach(craft => onClickCraft(craft))
}

function resetChosen() {
	chosenCraft.clear()
	$('.craft-td').removeClass('craft-td-selected')
}

function craftString() {
	if([...chosenCraft].length === 0) {
		errorAlert(8)
		return 
	}
	
	$(".result-panel").removeClass('result-panel-copied')
	$("#note-row").html('<i class="fa fa-lightbulb-o"></i>&nbsp;點擊區塊可直接複製完整字串')
	$("#result-panel").html([...chosenCraft].sort().join(' '))
	$(".result-row").css({'display': 'block'})
    jumpTo("result_title");
}

function copyToClipboard(e) {
	$("#result-panel").select()
	e.preventDefault();

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
	const dataArray = [...new Set(dataString.split(/\s+/).filter(str => str.length > 0).map(str => parseInt(str)))]
	dataArray.forEach(id => selectCraft(id))
	$('#inputPanel').modal('hide')
}