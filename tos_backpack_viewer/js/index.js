const tool_id = 'backpack';

let theme = 'normal';
let playerData = {uid: '', card: [], info: {}, wholeData: []}
let currentSeal = ''
let sealContentMonster = {}
let isReverseMode = false 	// 反向檢視
let isCompressMode = false	// 去除已有召喚獸檢視
let currentPage = 1
const pageSize = 12 * 5

const cardCategory = ['all', 'non-crossover', 'crossover'];
const cardCategoryTextArr = ['全部', '自家', '合作']
let currentCardCategory = 'all'	// 自家/合作檢視 (all, non-crossover, crossover)

let selectedAttr = []
let selectedRace = []
let selectedStar = []
let filteredMonster = []
let sortBy = ''
let orderBy = ''	// asc, desc
const sortByCategories = {
	time: '入手時間',
	id: '編號',
	attr: '屬性',
	race: '種族',
	level: '等級',
	skill_level: '技能等級',
	enhance_level: '昇華階數',
	star: '稀有度'
}
const orderByCategories = {
	asc: '升序',
	desc: '降序'
}

const showFirstStageAsEmptyPreview = ['NERV登錄器', '原子膠囊', '懷舊電視', '萬事屋之旅', '神玉封印 II', 'Nerve Gear啟動']
const showFinalStageEvenNotExist = ['強力武裝', '戰鬥魔導士', '百變騎士', '騰雲逸龍', '變形金屬']
const doNotIgnoreIndependentItem = ['強力武裝', '戰鬥魔導士', '百變騎士', '騰雲逸龍', '變形金屬']
const doNotSortById = ['靈殿狛犬', '強力武裝', '戰鬥魔導士', '百變騎士', '騰雲逸龍', '變形金屬']

$(window).resize(() => {
    $('.page_row').css(
        {
            top: (parseInt($('.sticky-top').css('height')))+'px'
        }
    )
});

$(document).ready(async function() {
	$("#reverse-btn").hide()
	$("#compress-btn").hide()
	$("#crossover-btn").hide()
	$("#filter-btn").hide()
    init()
	
	const currentTime = new Date().getTime()
	// All Max 活動時間
	const startTime = new Date('2023-01-21T00:00:00+0800').getTime()
	const endTime = new Date('2023-05-21T23:59:59+0800').getTime();
	if(currentTime < startTime || currentTime > endTime) {
		delete sealContent[Object.keys(sealContent).find(name => name.includes('自選'))]
	}
	
	$('.seal-row').html(renderSealTabs())
	
	currentSeal = Object.keys(sealContent).includes(localStorage.getItem('CURRENT_SEAL')) ? localStorage.getItem('CURRENT_SEAL') : Object.keys(sealContent)[0]
	
	filteredMonster = playerData?.wholeData || []
	sortBy = localStorage.getItem('SORT_BY') || 'time'
	orderBy = localStorage.getItem('ORDER_BY') || 'desc'
	
	Object.keys(sealContent).forEach((sealName, index) => {
		$(`#showSeal${index}`).on("click", (event) => selectSeal(index, event))
	})
	
	if(location.search) {
		$('.card-row').html(loadingPanel())
		await readUserIdFromUrl()
	}
	else {
		$('.uid-banner').html(playerData?.uid ? `<div>UID: ${playerData.uid}</div>` : '')
	}
	
	$(`#showSeal${Object.keys(sealContent).indexOf(currentSeal) != -1 ? Object.keys(sealContent).indexOf(currentSeal) : 0}`).click()
    
    $("#reverse-btn").length && $('#reverse-btn').click(() => { 
        reverseMode();
    });
    
    $("#compress-btn").length && $('#compress-btn').click(() => { 
        compressMode();
    });
    
    $("#crossover-btn").length && $('#crossover-btn').click(() => { 
        changeCardCategory();
    });
    
    $("#filter-btn").length && $('#filter-btn').click(() => { 
        openFilterPanel();
    });
	
    $("#filterPanel").length && $('#filterPanel').on('hide.bs.modal', (e) => startFilter(false))
	
	startFilter(true)
	
    $('.page_row').css(
        {
            top: (parseInt($('.sticky-top').css('height')))+'px'
        }
    )
});

function reverseMode() {
	isReverseMode = !isReverseMode
	
	isReverseMode && $("#reverse-btn").addClass('reverseMode-activate')
	!isReverseMode && $("#reverse-btn").removeClass('reverseMode-activate')
	
	showSeal(currentSeal)
}

function compressMode() {
	isCompressMode = !isCompressMode
	
	isCompressMode && $("#compress-btn").html('<i class="fa fa-expand"></i>').addClass('reverseMode-activate')
	!isCompressMode && $("#compress-btn").html('<i class="fa fa-compress"></i>').removeClass('reverseMode-activate')
	
	showSeal(currentSeal)
}

function changeCardCategory() {
	const nextIndex = (cardCategory.indexOf(currentCardCategory) + 1) % cardCategory.length
	currentCardCategory = cardCategory[nextIndex]
	$("#crossover-btn").html(cardCategoryTextArr[nextIndex])
	
	showSeal(currentSeal)
}

function startFilter(forceFilter = false) {
	const preSelectedAttr = [...selectedAttr]
	const preSelectedRace = [...selectedRace]
	const preSelectedStar = [...selectedStar]
	const preSortBy = localStorage.getItem('SORT_BY')
	const preOrderBy = localStorage.getItem('ORDER_BY')
	
	selectedAttr = Object.values(attr_zh_to_en).filter(attr => $(`.filter_icon_${attr}`).hasClass('filter_icon_selected'))
	selectedRace = Object.values(race_zh_to_en).filter(race => $(`.filter_icon_${race}`).hasClass('filter_icon_selected'))
	selectedStar = [...Array(8).keys()].filter(star => $(`.filter_icon_${star + 1}`).hasClass('filter_icon_selected')).map(star => star + 1)
	localStorage.setItem('SORT_BY', sortBy)
	localStorage.setItem('ORDER_BY', orderBy)
	
	if(selectedAttr.length || selectedRace.length || selectedStar.length) {
		$(".filters").addClass('filters-activate')
	} else {
		$(".filters").removeClass('filters-activate')
	}
	
	if(
		!forceFilter &&
		preSelectedAttr.join() === selectedAttr.join() &&
		preSelectedRace.join() === selectedRace.join() && 
		preSelectedStar.join() === selectedStar.join() &&
		preSortBy == sortBy &&
		preOrderBy == orderBy
	) return;
	
	filteredMonster = (playerData?.wholeData || []).filter(m => {
		const monster = monster_data.find(mon => mon.id === m.id)
		if(selectedAttr.length && !selectedAttr.some(attr => attr === attr_zh_to_en[monster.attribute])) return false
		if(selectedRace.length && !selectedRace.some(race => race === race_zh_to_en[monster.race])) return false
		if(selectedStar.length && !selectedStar.some(star => monster.star === star)) return false
		return true
	})
	
	filteredMonster.sort((a, b) => {
		const monster_a = monster_data.find(mon => mon.id === a.id)
		const monster_b = monster_data.find(mon => mon.id === b.id)
		
		const attrArr = Object.values(attr_zh_to_en)
		const raceArr = Object.values(race_zh_to_en)
		
		if(sortBy === 'time') {
			return orderBy === 'asc' ? a.acquiredAt - b.acquiredAt || a.id - b.id : b.acquiredAt - a.acquiredAt || a.id - b.id
		} else if(sortBy === 'id') {
			return orderBy === 'asc' ? a.id - b.id || a.acquiredAt - b.acquiredAt : a.id - b.id || a.acquiredAt - b.acquiredAt
		} else if(sortBy === 'attr') {
			return orderBy === 'asc' ? attrArr.indexOf(attr_zh_to_en[monster_a.attribute]) - attrArr.indexOf(attr_zh_to_en[monster_b.attribute]) || a.id - b.id : attrArr.indexOf(attr_zh_to_en[monster_b.attribute]) - attrArr.indexOf(attr_zh_to_en[monster_a.attribute]) || a.id - b.id
		} else if(sortBy === 'race') {
			return orderBy === 'asc' ? raceArr.indexOf(race_zh_to_en[monster_a.race]) - raceArr.indexOf(race_zh_to_en[monster_b.race]) || a.id - b.id : raceArr.indexOf(race_zh_to_en[monster_b.race]) - raceArr.indexOf(race_zh_to_en[monster_a.race]) || a.id - b.id
		} else if(sortBy === 'level') {
			return orderBy === 'asc' ? a.level - b.level || a.id - b.id : b.level - a.level || a.id - b.id
		} else if(sortBy === 'skill_level') {
			return orderBy === 'asc' ? a.skillLevel - b.skillLevel || a.id - b.id : b.skillLevel - a.skillLevel || a.id - b.id
		} else if(sortBy === 'enhance_level') {
			return orderBy === 'asc' ? (a?.enhanceLevel || 0 - b?.enhanceLevel || 0) || a.id - b.id : (b?.enhanceLevel || 0 - a?.enhanceLevel || 0) || a.id - b.id
		} else if(sortBy === 'star') {
			return orderBy === 'asc' ? (monster_a.star - monster_b.star) || a.id - b.id : (monster_b.star - monster_a.star) || a.id - b.id
		}
	})
	
	currentPage = 1
	showSeal(currentSeal)
}

function resetFilter() {
	Object.values(attr_zh_to_en).forEach(attr => $(`.filter_icon_${attr}`).removeClass('filter_icon_selected'));
	Object.values(race_zh_to_en).forEach(race => $(`.filter_icon_${race}`).removeClass('filter_icon_selected'));
	[...Array(8).keys()].forEach(star => $(`.filter_icon_${star + 1}`).removeClass('filter_icon_selected'))
}

function loadingPanel() {
	return `
		<div class="col-12 loadingPanel">載入資料中...</div>
	`
}

function renderSealTabs() {
	const tabCount = Object.keys(sealContent).length
	const tabLength = Math.trunc(12 / tabCount)
	const marginLength = (12 - tabLength * tabCount) / 2
	
	let str = ''
	if(marginLength > 0) str += `<div class='col-6 col-md-${marginLength} col-lg-${marginLength}'></div>`
	Object.keys(sealContent).forEach((sealName, index) => {
		str += `<div class='col-6 col-md-${tabLength} col-lg-${tabLength} seal-nav${index == 0 ? ' seal-nav-active' : ''}' id='showSeal${index}'>${sealName}</div>`
	})
	if(marginLength > 0) str += `<div class='col-6 col-md-${marginLength} col-lg-${marginLength}'></div>`
	
	return str
}

function selectSeal(index, event)
{
	const name = Object.keys(sealContent)[index]
	currentSeal = name
	
	if(currentSeal.endsWith('自選')) {
		$("#crossover-btn").hide()
		$("#filter-btn").hide()
		
		$("#reverse-btn").show()
		$("#compress-btn").show()
	} else if(currentSeal === '其他卡片') {
		$("#reverse-btn").hide()
		isReverseMode = false
		$("#reverse-btn").removeClass('reverseMode-activate')
		
		$("#compress-btn").hide()
		isCompressMode = false
		$("#compress-btn").html('<i class="fa fa-compress"></i>').removeClass('reverseMode-activate')
		$("#filter-btn").hide()
		
		$("#crossover-btn").show()
	} else if(currentSeal === '完整背包') {
		$("#reverse-btn").hide()
		isReverseMode = false
		$("#reverse-btn").removeClass('reverseMode-activate')
		
		$("#compress-btn").hide()
		isCompressMode = false
		$("#compress-btn").html('<i class="fa fa-compress"></i>').removeClass('reverseMode-activate')
		
		$("#crossover-btn").hide()
		$("#filter-btn").show()
	} else {
		$("#reverse-btn").hide()
		isReverseMode = false
		$("#reverse-btn").removeClass('reverseMode-activate')
		
		$("#compress-btn").hide()
		isCompressMode = false
		$("#compress-btn").html('<i class="fa fa-compress"></i>').removeClass('reverseMode-activate')
		
		$("#crossover-btn").hide()
		$("#filter-btn").hide()
	}
	
	$('.seal-nav').removeClass('seal-nav-active')
	$('#'+event.target.id).addClass('seal-nav-active')
	
	localStorage.setItem('CURRENT_SEAL', name)
	
	!playerData?.uid.length && $('#inventory-btn').click()
	showSeal(name)
}
	
function toggleTitleIcon(e, genreIndex) {
	if($(`.genre-content-${genreIndex}`).hasClass('show')) {
		$(`.collapse-close-${genreIndex}`).css({display: 'none'})
		$(`.collapse-open-${genreIndex}`).css({display: 'inline'})
	} else {
		$(`.collapse-close-${genreIndex}`).css({display: 'inline'})
		$(`.collapse-open-${genreIndex}`).css({display: 'none'})
	}
}

function showSeal(name)
{
	let cardStr = ''
	if(name === '完整背包') {
		cardStr += `<div class='col-12'>
						${renderPageControl(Math.ceil(filteredMonster.length / pageSize), 'up')}
						<div class='row whole_backpack_row'>
							<div class='col-12 row filtered-info-row'>
								<div class="col-12 col-sm-6 filtered-basis">
									${selectedAttr.map(attr => 
										`<span class='selected_icon'>
											<img src='../tos_tool_data/img/monster/icon_${attr}.png' width='36px' />
										</span>`
									).join('')}
									${selectedRace.map(race => 
										`<span class='selected_icon'>
											<img src='../tos_tool_data/img/monster/icon_${race}.png' width='36px' />
										</span>`
									).join('')}
									${selectedStar.map(star => 
										`<span class='selected_icon'>
											<img src='../tos_tool_data/img/monster/icon_${star}.png' width='36px' />
										</span>`
									).join('')}
								</div>
								<div class="col-12 col-sm-6 filtered-count">${filteredMonster.length} 張卡片</div>
							</div>
							<div class='col-12 row'>
								${filteredMonster.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(monster => {
									const sk_str = renderMonsterSingleInfo(monster)
									return renderMonsterSingleImage(monster, sk_str, true)
								}).join('')}
							</div>
						</div>
						<!--${renderPageControl(Math.ceil(filteredMonster.length / pageSize), 'down')}-->
					</div>`
	} else {
		const sealData = sealContent[name]
		
		const allCardTitle = [
			'給我看清楚了，這就是油的顏色',
			'無他，惟手油爾',
			'太油了吧',
			'瘋頭說：「再抽更多卡！」',
			'斗肉！萌死他咖斗！'
		]
		
		const allCardOtherTitle = [
			'讓你見識見識什麼才叫做牛棚'
		]
		
		const specialCardTitle = [
			'以後關卡記得要開放後晚十二小時再打喔'
		]
		
		const mustGetTitle = '五選一必能選中'
		
		Object.keys(sealData).forEach((genre, genreIndex) => {
			let cardData = sealData[genre]
			
			const mustGet = [...Array(5).keys()].map(i => i+1).includes(sealData[genre].filter(monster => {
				return Array.isArray(monster) ? !monster.some(id => playerData.card.includes(id)) : !playerData.card.includes(monster)
			}).length) || sealData[genre].length <= 5
			
			allCardStr = !name.includes('其他卡片') ? allCardTitle[Math.floor(Math.random()*(allCardTitle.length))] : allCardOtherTitle[Math.floor(Math.random()*(allCardOtherTitle.length))]
			
			spCardStr = specialCardTitle[0]
			
			let genreStr = `${genre}`
			if(name.includes('自選')) {
				const attr = attr_zh_to_en[genre.split(' ‧ ')[0].trim()[0]]
				const race = race_zh_to_en[genre.split(' ‧ ')[1].trim()]
				genreStr = `<img src='../tos_tool_data/img/monster/icon_${attr}.png' style='width: 1em'>&nbsp;<img src='../tos_tool_data/img/monster/icon_${race}.png' style='width: 1em'>&nbsp;${genreStr}`
			} 
			if(name.includes('其他卡片')) {
				function isCardInCorrectCategory(id) {
					const allCategory = currentCardCategory === 'all'
					const onlyNonCrossOver = currentCardCategory === 'non-crossover'
					const onlyCrossOver = currentCardCategory === 'crossover'
					
					const isCardCrossOver = monster_data.find(monster => monster.id === id)?.crossOver
					
					return allCategory || (onlyNonCrossOver && !isCardCrossOver) || (onlyCrossOver && isCardCrossOver)
				}
				
				let cardSet = new Set()
				sealData[genre].forEach(card => {
					if(typeof card === 'string') {
						const tagFilteredMonster = monster_data.filter((element) => {
							return element?.monsterTag.includes(card)
						}).filter(element => isCardInCorrectCategory(element.id))?.map(info => info.id)
						
						tagFilteredMonster.forEach(monster => cardSet.add(monster))
					} else {
						if(Array.isArray(card)) {
							card.forEach(c => {
								if(!doNotIgnoreIndependentItem.includes(genre) && cardSet.has(c)) cardSet.delete(c)
							})
							card.every(c => isCardInCorrectCategory(c)) && cardSet.add(card)
						} else {
							if(card > 0 && isCardInCorrectCategory(card)) cardSet.add(card)
							else if(!doNotIgnoreIndependentItem.includes(genre)) cardSet.delete(-card)
						}
					}
				})
				cardData = doNotSortById.includes(genre) ? [...cardSet] : [...cardSet].sort((a, b) => {
					const ca = Array.isArray(a) ? a[0] : a
					const cb = Array.isArray(b) ? b[0] : b
					return ca - cb
				})
			}
			
			const hasCard = showFinalStageEvenNotExist.includes(genre) ? cardData.every(monster => {
				return Array.isArray(monster) ? playerData.card.includes([...monster].reverse()[0]) : playerData.card.includes(monster)
			}) : cardData.every(monster => {
				return Array.isArray(monster) ? monster.some(id => playerData.card.includes(id)) : playerData.card.includes(monster)
			})
			
			const cardNum = cardData.length
			const cardNumHave = cardData.filter(monster => Array.isArray(monster) ? monster.some(id => playerData.card.includes(id)) : playerData.card.includes(monster)).length
			const cardHaveRatioElement = `<div class="cardHaveRatio">${cardNumHave} / ${cardNum}</div>`
			
			const genreNameTitle = (genre === '境外探索') ? spCardStr : (isReverseMode && mustGet) ? mustGetTitle : (!isReverseMode && hasCard) ? allCardStr : ''
			
			const expandIcon = `
				<div class='collapse-icon collapse-icon-${genreIndex}' data-toggle="collapse" data-target=".genre-content-${genreIndex}" aria-expanded="true" onclick='toggleTitleIcon(event, ${genreIndex})'>
					<i class="fa fa-caret-up collapse-close collapse-close-${genreIndex}" style='display: inline;'></i>
					<i class="fa fa-caret-down collapse-open collapse-open-${genreIndex}" style='display: none;'></i>
				</div>
			`
			
			if(cardData.length > 0 && (!isCompressMode || !hasCard)) {
				cardStr += `
					<div class="col-12 col-sm-6">
						<div class="row genre-row">
							<div class='col-12 genre-name${(isReverseMode && mustGet) ? ' genre-name-mustGet' : (!isReverseMode && hasCard) ? ' genre-name-allCollected' : ''}' title=${genreNameTitle}>
								${expandIcon}
								${genreStr}${cardHaveRatioElement}
							</div>
							<div class="col-12 genre-content-${genreIndex} show">
								<div class="row">
								${cardData.map(id => {
									const sk_str = renderMonsterSeriesInfo(genre, Array.isArray(id) ? id : [id])
									return renderMonsterSeriesImage(genre, Array.isArray(id) ? id : [id], sk_str)
								}).join('')}
								</div>
							</div>
							<div class='col-12'>
								<hr />
							</div>
						</div>
					</div>
				`
			}
		})
	}
	
	$('.card-row').html(cardStr)
	
    $('[data-toggle=popover]').popover({
		container: 'body',
		html: true,
		sanitize: false,
		trigger: 'focus',
		placement: 'bottom',
    })
	
    $('[data-toggle=popover-single]').popover({
		container: 'body',
		html: true,
		sanitize: false,
		trigger: 'focus',
		placement: 'bottom',
    })
	
    $('.page_row').css(
        {
            top: (parseInt($('.sticky-top').css('height')))+'px'
        }
    )
	
	// Saitama easter egg :)
	setGlassBreak()
}

function renderPageControl(pageCount, position) {
	let str = ''
	str += `
		${position == 'down' ? '<hr class="page_row_hr"/>' : ''}
		<div class='row page_row'>
			
			<div class='col-0 col-sm-3'></div>
			<div class='col-2 col-sm-1'>
				${currentPage > 1 ? '<i class="fa-solid fa-angles-left" onclick="controlPage(-9999)"></i>' : ''}
			</div>
			<div class='col-2 col-sm-1'>
				${currentPage > 1 ? '<i class="fa-solid fa-circle-arrow-left" onclick="controlPage(-1)"></i>' : ''}
			</div>
			<div class='col-4 col-sm-2'>
				<span class='page_current'>${currentPage}</span><span class='page_total'> / ${pageCount}</span>
			</div>
			<div class='col-2 col-sm-1'>
				${currentPage < pageCount ? '<i class="fa-solid fa-circle-arrow-right" onclick="controlPage(1)"></i>' : ''}
			</div>
			<div class='col-2 col-sm-1'>
				${currentPage < pageCount ? '<i class="fa-solid fa-angles-right" onclick="controlPage(9999)"></i>' : ''}
			</div>
			<div class='col-0 col-sm-3'></div>
		</div>
		<hr class="page_row_hr"/>
	`
	
	return str
}

function controlPage(offset) {
	const pageCount = Math.ceil(filteredMonster.length / pageSize)
	
	currentPage += offset
	currentPage = currentPage < 1 ? 1 : currentPage > pageCount ? pageCount : currentPage
	
	showSeal(currentSeal)
}

function openUidInputPanel()
{
    $('#uidPanel').modal('show');
    renderUidInputPanel();
}

function renderUidInputPanel()
{
    let render_str = "";
	render_str += `
	<div class='row uid-row'>
		<div class='col-6 col-md-6 col-lg-6 uid-nav uid-nav-active' id='loadInventoryNav' onclick='switchGetInventory("load")'>匯入背包</div>
		<div class='col-6 col-md-6 col-lg-6 uid-nav' id='updateInventoryNav' onclick='switchGetInventory("update")'>更新背包</div>
		<div class='col-12 my-2'></div>
		
		<div class='col-12 col-md-12 col-lg-12 uid-tab' id='loadInventoryTab' style='display: block;'>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<input type='text' class='form-control uid-input' id='load-uid-input' placeholder='輸入 UID' maxlength=${uid_maxlength} onkeypress='return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))'>
			</div>
			<!--<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<input type='text' class='form-control uid-input' id='load-veri-input' placeholder='輸入驗證碼' maxlength=${veri_maxlength} onkeypress='return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))'>
			</div>-->
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<div>
					<button class='btn btn-success btn-block uid-btn' id='load-confirm-uid' onclick='getPlayerInventory("load")'>
						確定
					</button>
				</div>
				<div>
					<button class='btn btn-success btn-block uid-btn' id='load-save-inventory' onclick='savePlayerInventory("load")'>
						儲存背包
					</button>
				</div>
			</div>
			<div class='col-12 col-md-12 col-lg-12 uid-status' id='load-uid-status'></div>
		</div>
		
		<div class='col-12 col-md-12 col-lg-12 uid-tab' id='updateInventoryTab' style='display: none;'>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<input type='text' class='form-control uid-input' id='update-uid-input' placeholder='輸入 UID' maxlength=${uid_maxlength} onkeypress='return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))'>
			</div>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<input type='text' class='form-control uid-input' id='update-veri-input' placeholder='輸入驗證碼' maxlength=${veri_maxlength} onkeypress='return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))'>
			</div>
			<div class='col-12 col-md-12 col-lg-12 btn-shell'>
				<div>
					<button class='btn btn-success btn-block uid-btn' id='update-confirm-uid' onclick='getPlayerInventory("update")'>
						確定
					</button>
				</div>
				<div>
					<button class='btn btn-success btn-block uid-btn' id='update-save-inventory' onclick='savePlayerInventory("update")'>
						儲存背包
					</button>
				</div>
			</div>
			<div class='col-12 col-md-12 col-lg-12 uid-status' id='update-uid-status'></div>
		</div>
	</div>
	`

    $("#uidPanel .modal-body").html(render_str)
	$('#load-confirm-uid').css({'display': 'block'})
	$('#load-save-inventory').css({'display': 'none'})
	$('#update-confirm-uid').css({'display': 'block'})
	$('#update-save-inventory').css({'display': 'none'})
}

function switchGetInventory(state)
{
	if(state === 'load') {
		$("#loadInventoryNav").addClass('uid-nav-active')
		$("#updateInventoryNav").removeClass('uid-nav-active')
		
		$("#loadInventoryTab").css({'display': 'block'})
		$("#updateInventoryTab").css({'display': 'none'})
	}
	else {
		$("#loadInventoryNav").removeClass('uid-nav-active')
		$("#updateInventoryNav").addClass('uid-nav-active')
		
		$("#loadInventoryTab").css({'display': 'none'})
		$("#updateInventoryTab").css({'display': 'block'})
	}
	
	$('#load-uid-input').val('')
	//$('#load-veri-input').val('')
	$('#update-uid-input').val('')
	$('#update-veri-input').val('')
	$('#load-confirm-uid').css({'display': 'block'})
	$('#load-save-inventory').css({'display': 'none'})
	$('#update-confirm-uid').css({'display': 'block'})
	$('#update-save-inventory').css({'display': 'none'})
	$('#load-uid-status').html('')
	$('#update-uid-status').html('')
	$('#load-uid-input').attr('disabled', false)
	$('#update-uid-input').attr('disabled', false)
}

function openFilterPanel() {
    $('#filterPanel').modal('show');
    renderFilterPanel();
}

function selectFilter(t) {
	if($(`.filter_icon_${t}`).hasClass(`filter_icon_selected`)) $(`.filter_icon_${t}`).removeClass(`filter_icon_selected`)
	else $(`.filter_icon_${t}`).addClass(`filter_icon_selected`)
}

function renderFilterPanel() {
	
	function changeSortBy(value) {
		sortBy = value
	}
	
	function changeOrderBy(value) {
		orderBy = value
	}
	
	let render_str = "";
	render_str += `
	<div class='container-fluid filter-row'>
		<div class='row'>
			<div class='col-2'>
				屬性
			</div>
			<div class='col-10 filterBtnRow'>
				${Object.values(attr_zh_to_en).map(attr => 
					`<div class='attr_selector'>
						<img class='filter_icon_${attr}${selectedAttr.includes(attr) ? ` filter_icon_selected` : ``}' src='../tos_tool_data/img/monster/icon_${attr}.png' onclick='selectFilter("${attr}")' />
					</div>`
				).join('')}
			</div>
		</div>
		<div class='row'>
			<div class='col-2'>
				種族
			</div>
			<div class='col-10 filterBtnRow'>
				${Object.values(race_zh_to_en).map(race => 
					`<div class='race_selector'>
						<img class='filter_icon_${race}${selectedRace.includes(race) ? ` filter_icon_selected` : ``}' src='../tos_tool_data/img/monster/icon_${race}.png' onclick='selectFilter("${race}")' />
					</div>`
				).join('')}
			</div>
		</div>
		<div class='row'>
			<div class='col-2'>
				稀有度
			</div>
			<div class='col-10 filterBtnRow'>
				${[...Array(8).keys()].map(star => 
					`<div class='star_selector'>
						<img class='filter_icon_${star + 1}${selectedStar.includes(star + 1) ? ` filter_icon_selected` : ``}' src='../tos_tool_data/img/monster/icon_${star + 1}.png' onclick='selectFilter("${star + 1}")' />
					</div>`
				).join('')}
			</div>
		</div>
		<div class='row'>
			<div class='col-2'>
				排序
			</div>
			<div class='col-10 filterBtnRow sort-row'>
				<div class='container-fluid row'>
					<div class='col-12 col-sm-6'>
						<select class="sort-by" value="${sortBy}">
							${
								Object.keys(sortByCategories).map(item => {
									return `<option value="${item}" ${sortBy === item && 'selected'}>${sortByCategories[item]}</option>`
								}).join('')
							}
						</select>
					</div>
					<div class='col-12 col-sm-6'>
						<select class="order-by" value="${orderBy}">
							${
								Object.keys(orderByCategories).map(item => {
									return `<option value="${item}" ${orderBy === item && 'selected'}>${orderByCategories[item]}</option>`
								}).join('')
							}
						</select>
					</div>
				</div>
			</div>
		</div>
	</div>
	`

    $("#filterPanel .modal-body").html(render_str)
	
	$('.sort-by').on('change', (e) => {
		changeSortBy(e?.target?.value || 'time')
	})
	$('.order-by').on('change', (e) => {
		changeOrderBy(e?.target?.value || 'desc')
	})
}

function renderMonsterSeriesInfo(genreName, monsters) {
	return `
		<div class='row' style='padding: 0 4px;'>
			${monsters.map(id => {
				const monster = monster_data.find((element) => {
					return element.id === id
				})
				const monster_attr = !monster?.attribute?.length ? '' : monster?.attribute
				const notInInventory = isReverseMode ? playerData.card.includes(monster?.id) : !playerData.card.includes(monster?.id)
				return `
					<div class='result_monster_block'>
						<img class='tooltip_monster_img${notInInventory ? '_gray' : ''}' src='../tos_tool_data/img/monster/${monster?.id}.png' title='${monster?.name ?? ''}' onerror='monsterErrorImage(this, \`${monster_attr}\`)'></img>
						<div class='monsterId${notInInventory ? '_gray' : ''}'>
							<a href='https://tos.fandom.com/zh/wiki/${monster?.id}' target='_blank'>${monster?.id ? paddingZeros(monster.id, 3) : '???'}</a>
						</div>
						<div class='monsterCount${notInInventory ? '_gray' : ''}'>
							×${playerData?.info?.[id]?.number || 0}
						</div>
					</div>
				`
			}).join('')}
		</div>
	`
}

function renderMonsterSingleInfo(data) {
	const monster_info = monster_data.find((element) => {
		return element.id == data.id;
	});
	
	return `
		<div class='row monster-single-info-header'>
			<div class='col-5 col-sm-1 monster-attr'>
				<img src='../tos_tool_data/img/monster/icon_${attr_zh_to_en[monster_info.attribute]}.png' width='25px'/>
			</div>
			<div class='col-2 col-sm-1 monster-race'>
				<img src='../tos_tool_data/img/monster/icon_${race_zh_to_en[monster_info.race]}.png' width='25px'/>
			</div>
			<div class='col-5 col-sm-1 monster-star'>
				<img src='../tos_tool_data/img/monster/icon_${monster_info.star}.png' width='25px'/>
			</div>
			<div class='skill_tooltip monster-name monster_name_${attr_zh_to_en[monster_info.attribute]} col-12 col-sm-9'>${monster_info.name}</div>
			<hr>
			<div class='container-fluid row'>
				<div class='col-4 col-sm-4 info-title'>
					等級
				</div>
				<div class='col-8 col-sm-8'>
					<span class='monster-stats${data?.level === monster_info?.maxLevel ? ' monster-stats-full' : ''}'>${data?.level}</span> / ${monster_info?.maxLevel || '???'}
				</div>
			</div>
			<hr>
			<div class='container-fluid row'>
				<div class='col-4 col-sm-4 info-title'>
					技能等級
				</div>
				<div class='col-8 col-sm-8'>
					<span class='monster-stats${data?.skillLevel === monster_info?.maxSkill ? ' monster-stats-full' : ''}'>${data?.skillLevel}</span> / ${monster_info?.maxSkill >= 0 ? monster_info?.maxSkill : '???'}
				</div>
			</div>
			${monster_info?.maxRefine > 0 ?
				`
				<hr>
				<div class='container-fluid row'>
					<div class='col-4 col-sm-4 info-title'>
						昇華
					</div>
					<div class='col-8 col-sm-8'>
						<span class='monster-stats${data?.enhanceLevel === monster_info?.maxRefine ? ' monster-stats-full' : ''}'>${data?.enhanceLevel}</span> / ${monster_info?.maxRefine || '???'}
					</div>
				</div>
				`
				: ''
			}
		</div>
	`
}

function renderMonsterSeriesImage(genreName, series, tooltip_content) {
	const finalStage = showFirstStageAsEmptyPreview.includes(genreName) ? series[0] : series[series.length - 1]
	const monster = monster_data.find(monster => monster.id === finalStage)
	const monster_attr = !monster?.attribute?.length ? '' : monster?.attribute
    const notInInventory = isReverseMode ? series.some(id => playerData.card.includes(id)) : showFinalStageEvenNotExist.includes(genreName) ? !playerData.card.includes([...series].reverse()[0]) : !series.some(id => playerData.card.includes(id))
	const finalStageMonsterIdInInventory = showFinalStageEvenNotExist.includes(genreName) ? [...series].reverse()[0] : [...series].reverse().find(id => playerData.card.includes(id) && playerData.info[id]?.number > 0)
	const monsterToDisplay = !isReverseMode && !notInInventory ? monster_data.find(monster => monster.id === finalStageMonsterIdInInventory) : monster
	const shouldShowImage = isCompressMode ? isReverseMode ? !notInInventory : notInInventory : true
	
    return shouldShowImage ? `
        <div class='col-4 col-md-3 col-lg-2 series_result'>
			<div class='image_shell' tabindex=${monsterToDisplay?.id?.toString().replace('?', '')} data-toggle='popover' data-title='' data-content="${tooltip_content}">
				${(!isReverseMode && !notInInventory) ? renderInfoTag(finalStageMonsterIdInInventory) : ``}
				<img class='monster_img${notInInventory ? '_gray' : ''}' src='../tos_tool_data/img/monster/${monsterToDisplay?.id}.png' onerror='monsterErrorImage(this, "${monster_attr}")'></img>
			</div>
        </div>
    ` : '';
}

function renderMonsterSingleImage(data, tooltip_content, isWholeWidth) {
	const monster = monster_data.find(monster => monster.id === data?.id)
	const monster_attr = !monster?.attribute?.length ? '' : monster?.attribute
	
    return `
        <div class='col-3 col-md-2 col-lg-1 series_result'>
			<div class='image_shell' tabindex=${data?.id?.toString().replace('?', '')} data-toggle='popover-single' data-title='' data-content="${tooltip_content}">
				${renderSingleInfoTag(data)}
				<img class='monster_img' src='../tos_tool_data/img/monster/${data?.id}.png' onerror='monsterErrorImage(this, "${monster_attr}")'></img>
			</div>
        </div>
    `;
}

function renderInfoTag(id) {
	const data = playerData?.info?.[id] || {}
	const refine_src = data?.enhanceLevel < 5 ? `../tos_tool_data/img/monster/refine_${data?.enhanceLevel}.png` : '../tos_tool_data/img/monster/recall.png'
	
	return `
		<div class='skill_level_tag'>
			SLv. ${data?.skillLevel ?? '???'}
		</div>
		<div class='bottom_tag ${ data?.enhanceLevel > 0 ? `bottom_tag_long` : `` }'>
			${ data?.enhanceLevel > 0 ?
				`<img src="${refine_src}" />` : ``
			}
			<div class='level_tag ${ data?.enhanceLevel > 0 ? `level_tag_short` : ``}'>
				${renderBottomTagContent(id)}
			</div>
		</div>
	`
}

function renderSingleInfoTag(data) {
	const refine_src = data?.enhanceLevel < 5 ? `../tos_tool_data/img/monster/refine_${data?.enhanceLevel}.png` : '../tos_tool_data/img/monster/recall.png'
	
	return `
		<div class='skill_level_tag'>
			SLv. ${data?.skillLevel ?? '???'}
		</div>
		<div class='bottom_tag ${ data?.enhanceLevel > 0 ? `bottom_tag_long` : `` }'>
			${ data?.enhanceLevel > 0 ?
				`<img src="${refine_src}" />` : ``
			}
			<div class='level_tag ${ data?.enhanceLevel > 0 ? `level_tag_short` : ``}'>
				${renderSingleBottomTagContent(data)}
			</div>
		</div>
	`
}

function renderBottomTagContent(id) {
	const data = playerData?.info?.[id] || {}
	const level = data?.level || '???'
	const skillLevel = data?.skillLevel || 0
	const enhanceLevel = data?.enhanceLevel || 0
	
	const monster = monster_data.find(monster => monster.id === id)
	const maxLevel = monster?.maxLevel || 0
	const maxSkill = monster?.maxSkill || 0
	const maxRefine = monster?.maxRefine || 0
	
	if(level < maxLevel) return `Lv. ${level}`
	
	if(maxRefine > 0 && level >= maxLevel && skillLevel >= maxSkill && enhanceLevel >= maxRefine) return '<span class="all_max_tag">All Max</span>'
	if(level == maxLevel && skillLevel == maxSkill) return '<span class="dual_max_tag">Dual Max</span>'
	if(level == maxLevel) return '<span class="lv_max_tag">Lv. Max</span>'
	
	return 'Lv. ???'
}

function renderSingleBottomTagContent(data) {
	const level = data?.level || '???'
	const skillLevel = data?.skillLevel || 0
	const enhanceLevel = data?.enhanceLevel || 0
	
	const monster = monster_data.find(monster => monster.id === data?.id)
	const maxLevel = monster?.maxLevel || 0
	const maxSkill = monster?.maxSkill || 0
	const maxRefine = monster?.maxRefine || 0
	
	if(level < maxLevel) return `Lv. ${level}`
	
	if(maxRefine > 0 && level >= maxLevel && skillLevel >= maxSkill && enhanceLevel >= maxRefine) return '<span class="all_max_tag">All Max</span>'
	if(level == maxLevel && skillLevel == maxSkill) return '<span class="dual_max_tag">Dual Max</span>'
	if(level == maxLevel) return '<span class="lv_max_tag">Lv. Max</span>'
	
	return 'Lv. ???'
}

function renderResult() {
	showSeal(currentSeal)
}

function monsterErrorImage(img, attr) {
	img.src = `../tos_tool_data/img/monster/noname${attr.length > 0 ? `_${attr_zh_to_en[attr]}` : ''}.png`
}

async function readUserIdFromUrl() {
	const code_array = location.search.split("?")[1].split("&")[0].split("=")
	
	if(code_array[0] !== 'uid') {
		errorAlert(1)
		window.location = 'https://tinghan33704.com/tos_backpack_viewer/tos_backpack_viewer.html'
		return
	}
	
	const uid = code_array[1]
	
	await getPlayerInventory('load', uid)
}