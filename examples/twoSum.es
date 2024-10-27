let twoSum = fn(nums, target) {
  let map = dict(); 
  let len = len(nums);
  let i = 0;
  
  while (i < len) {
    let num = nums[i];
    let diff = target - num;
    if (map[diff] != null) {
      return [map[diff], i]; 
    }
    map[num] = i; 
    i = i + 1;
  }
  return null;
};

let nums = [2, 7, 11, 15];
let target = 9;
print(twoSum(nums, target));
